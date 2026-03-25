import { getOpenAIClient } from "./openai";
import { buildOpenAITools, getAllRuntimeTools, resolveToolByOpenAIName } from "./tools";
import { normalizeFinalAssistantResponse, normalizeToolResultToCards } from "./normalizer";

const DEFAULT_SYSTEM_PROMPT = `You are the official assistant for Vacker Advertising in Uganda.
- Be concise, helpful, and commercial-friendly.
- Use the internal company profile tool for company facts, contacts, services, and social media links.
- Never fabricate unavailable data; if unknown, say so and offer the official contact channels.
- Prefer cards and structured responses.
Always return final response as strict JSON: {"text": string, "cards": Card[]}.`;

type AgentResult = {
  text: string;
  cards: any[];
  toolStatus: string[];
};

export async function runAgent(sessionId: string, userMessage: string): Promise<AgentResult> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required");

  const runtimeTools = await getAllRuntimeTools();
  const oaTools = buildOpenAITools(runtimeTools);
  const client = getOpenAIClient({ model, baseUrl, apiKey, defaultHeaders: null });

  const messages: any[] = [
    {
      role: "system",
      content: `${DEFAULT_SYSTEM_PROMPT}\n\nCurrent session: ${sessionId}`
    },
    { role: "user", content: userMessage }
  ];

  const toolStatus: string[] = [];
  const generatedCards: any[] = [];

  for (let step = 0; step < 6; step++) {
    const completion = await client.chat.completions.create({
      model,
      messages,
      tools: oaTools,
      tool_choice: "auto",
      temperature: 0.2
    });

    const msg = completion.choices[0]?.message;
    if (!msg) throw new Error("No response from model");

    if (!msg.tool_calls?.length) {
      const payload = normalizeFinalAssistantResponse(msg.content, generatedCards);
      return { text: payload.text, cards: payload.cards, toolStatus };
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

      try {
        const result = await runtimeTool.execute(args);
        generatedCards.push(...normalizeToolResultToCards(runtimeTool.label, result, runtimeTool.cardRenderer));
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      } catch (error) {
        const message = (error as Error).message;
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: message }) });
      }
    }
  }

  return { text: "I reached the tool-step limit. Please narrow the request.", cards: generatedCards, toolStatus };
}
