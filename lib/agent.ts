import { db } from "./db";
import { getOpenAIClient } from "./openai";
import { buildOpenAITools, getAllRuntimeTools, resolveToolByOpenAIName } from "./tools";
import { createApprovalRequest } from "./approvals";
import { normalizeFinalAssistantResponse, normalizeToolResultToCards } from "./normalizer";

const DEFAULT_SYSTEM_PROMPT = `You are a company assistant.
- Be concise and helpful.
- Use tools for company facts and connected MCP apps.
- Never fabricate unavailable data.
- For side-effects, request approval.
- Prefer cards and structured responses.
Always return final response as strict JSON: {"text": string, "cards": Card[]}.`;

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`).join(",")}}`;
}

type AgentResult = {
  text: string;
  cards: any[];
  toolStatus: string[];
  approvalRequest?: { id: string; toolKey: string; args: unknown; reason?: string };
};

type ApprovedExecution = {
  requestId: string;
  toolKey: string;
  argsHash: string;
};

export async function runAgent(
  sessionId: string,
  userMessage: string,
  opts?: { approvedRequestId?: string; approvedToolKey?: string; approvedArgs?: unknown }
): Promise<AgentResult> {
  const provider = await db.providerSettings.findFirst({ where: { enabled: true }, orderBy: { updatedAt: "desc" } });
  if (!provider) throw new Error("No enabled provider configured");

  const [settings, mappings] = await Promise.all([
    db.assistantSettings.findFirst(),
    db.questionMapping.findMany({ where: { enabled: true }, take: 10, orderBy: { updatedAt: "desc" } })
  ]);

  const mappingHints = mappings
    .map((m) => `Q: ${m.question} -> collection:${m.collectionId ?? "n/a"}, tool:${m.preferredTool ?? "n/a"}, card:${m.cardType ?? "n/a"}, hint:${m.systemHint ?? ""}`)
    .join("\n");

  const runtimeTools = await getAllRuntimeTools();
  const oaTools = buildOpenAITools(runtimeTools);
  const history = await db.chatMessage.findMany({ where: { sessionId }, orderBy: { createdAt: "asc" }, take: 30 });

  await db.chatMessage.create({ data: { sessionId, role: "user", content: userMessage } });

  const client = getOpenAIClient(provider);
  const messages: any[] = [
    {
      role: "system",
      content: `${settings?.systemPrompt || DEFAULT_SYSTEM_PROMPT}\n\nTool policy: obey approval modes.\nQuestion mappings:\n${mappingHints || "(none)"}`
    },
    ...history.map((m) => ({ role: m.role === "assistant" ? "assistant" : m.role === "user" ? "user" : "tool", content: m.content, tool_call_id: m.toolCallId || undefined })),
    { role: "user", content: userMessage }
  ];

  const toolStatus: string[] = [];
  const generatedCards: any[] = [];
  let approvedExecution: ApprovedExecution | null = null;

  if (opts?.approvedRequestId) {
    const approvedRequest = await db.approvalRequest.findUnique({ where: { id: opts.approvedRequestId } });
    if (
      approvedRequest &&
      approvedRequest.sessionId === sessionId &&
      approvedRequest.status === "approved" &&
      approvedRequest.toolKey === opts.approvedToolKey
    ) {
      approvedExecution = {
        requestId: approvedRequest.id,
        toolKey: approvedRequest.toolKey,
        argsHash: stableStringify(approvedRequest.args)
      };
    }
  }

  for (let step = 0; step < 6; step++) {
    const completion = await client.chat.completions.create({
      model: provider.model,
      messages,
      tools: oaTools,
      tool_choice: "auto",
      temperature: 0.2
    });

    const msg = completion.choices[0]?.message;
    if (!msg) throw new Error("No response from model");

    if (!msg.tool_calls?.length) {
      const payload = normalizeFinalAssistantResponse(msg.content, generatedCards);
      const final = { text: payload.text, cards: payload.cards, toolStatus };
      await db.chatMessage.create({ data: { sessionId, role: "assistant", content: final.text, structured: final as any } });
      return final;
    }

    messages.push({ role: "assistant", tool_calls: msg.tool_calls });

    for (const call of msg.tool_calls) {
      const runtimeTool = resolveToolByOpenAIName(runtimeTools, call.function.name);
      if (!runtimeTool) {
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: `Unknown tool: ${call.function.name}` }) });
        continue;
      }

      const args = JSON.parse(call.function.arguments || "{}");
      toolStatus.push(`Using ${runtimeTool.label}...`);

      if (runtimeTool.approvalMode === "deny") {
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: "Tool denied by policy" }) });
        continue;
      }

      const approvedArgsMatch =
        approvedExecution?.toolKey === runtimeTool.key &&
        approvedExecution.argsHash === stableStringify(args);

      if (runtimeTool.approvalMode === "ask" && !approvedArgsMatch) {
        const req = await createApprovalRequest(sessionId, runtimeTool.key, args, "This action may have side effects.");
        const pending: AgentResult = {
          text: `I need your approval before I run ${runtimeTool.label}.`,
          cards: [],
          toolStatus,
          approvalRequest: { id: req.id, toolKey: runtimeTool.key, args, reason: req.reason || undefined }
        };
        await db.chatMessage.create({ data: { sessionId, role: "assistant", content: pending.text, structured: pending as any } });
        return pending;
      }

      if (approvedArgsMatch && approvedExecution) {
        toolStatus.push(`Using approval ${approvedExecution.requestId} for ${runtimeTool.label}.`);
      }

      const start = Date.now();
      try {
        const result = await runtimeTool.execute(args);
        generatedCards.push(...normalizeToolResultToCards(runtimeTool.label, result, runtimeTool.cardRenderer));
        await db.toolExecutionLog.create({ data: { toolKey: runtimeTool.key, args: args as any, result: result as any, success: true, latencyMs: Date.now() - start } });
        await db.chatMessage.create({ data: { sessionId, role: "tool", content: JSON.stringify(result), toolName: runtimeTool.key, toolCallId: call.id } });
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      } catch (error) {
        const message = (error as Error).message;
        await db.toolExecutionLog.create({ data: { toolKey: runtimeTool.key, args: args as any, success: false, error: message, latencyMs: Date.now() - start } });
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: message }) });
      }
    }
  }

  const fallback: AgentResult = { text: "I reached the tool-step limit. Please narrow the request.", cards: generatedCards, toolStatus };
  await db.chatMessage.create({ data: { sessionId, role: "assistant", content: fallback.text, structured: fallback as any } });
  return fallback;
}
