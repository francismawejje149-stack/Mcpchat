import { ApprovalMode, MCPTool, SideEffectLevel } from "@prisma/client";
import { z } from "zod";
import { db } from "./db";
import { executeMcpTool } from "./mcp";

type RuntimeTool = {
  key: string;
  label: string;
  description: string;
  schema: Record<string, unknown>;
  approvalMode: ApprovalMode;
  sideEffect: SideEffectLevel;
  readOnly: boolean;
  cardRenderer?: string | null;
  execute: (args: any) => Promise<unknown>;
};

function buildCollectionSchema(fields: { key: string; type: string }[]) {
  const props: Record<string, unknown> = {
    query: { type: "string", description: "Free text query" },
    limit: { type: "number", default: 10 }
  };
  for (const field of fields) props[field.key] = { type: "string" };
  return { type: "object", properties: props, additionalProperties: false };
}

export async function getInternalCollectionTools(): Promise<RuntimeTool[]> {
  const collections = await db.collection.findMany({ where: { enabled: true }, include: { fields: true } });
  return collections.map((collection) => ({
    key: `internal.${collection.slug}`,
    label: `Search ${collection.name}`,
    description: `Search company collection: ${collection.name}`,
    schema: buildCollectionSchema(collection.fields),
    approvalMode: "auto",
    sideEffect: "read",
    readOnly: true,
    cardRenderer: collection.defaultRenderer,
    execute: async (args) => {
      const records = await db.collectionRecord.findMany({ where: { collectionId: collection.id }, take: 100 });
      const query = String(args?.query || "").toLowerCase();
      const filtered = records
        .map((r) => r.data as Record<string, any>)
        .filter((row) => {
          const text = JSON.stringify(row).toLowerCase();
          if (query && !text.includes(query)) return false;
          for (const [k, v] of Object.entries(args || {})) {
            if (["query", "limit"].includes(k) || v === undefined || v === null || v === "") continue;
            if (!String(row[k] ?? "").toLowerCase().includes(String(v).toLowerCase())) return false;
          }
          return true;
        });
      return { collection: collection.name, items: filtered.slice(0, Number(args?.limit || 10)) };
    }
  }));
}

function mapMcpTool(tool: MCPTool, server: any): RuntimeTool {
  return {
    key: `mcp.${server.id}.${tool.toolName}`,
    label: tool.label,
    description: tool.description || `${server.name} - ${tool.toolName}`,
    schema: (tool.inputSchema as Record<string, unknown>) ?? { type: "object", properties: {} },
    approvalMode: tool.approvalMode,
    sideEffect: tool.sideEffect,
    readOnly: tool.readOnly,
    cardRenderer: tool.cardRenderer,
    execute: async (args) => executeMcpTool(server, tool.toolName, args)
  };
}

export async function getAllRuntimeTools(): Promise<RuntimeTool[]> {
  const internal = await getInternalCollectionTools();
  const mcpServers = await db.mCPServer.findMany({ where: { enabled: true }, include: { tools: { where: { enabled: true } } } });
  const mcp = mcpServers.flatMap((s) => s.tools.map((t) => mapMcpTool(t, s)));
  const policies = await db.toolApprovalPolicy.findMany();
  const policyMap = new Map(policies.map((p) => [p.toolKey, p]));
  return [...internal, ...mcp].map((tool) => {
    const policy = policyMap.get(tool.key);
    if (!policy) return tool;
    return { ...tool, approvalMode: policy.approvalMode, sideEffect: policy.sideEffect, readOnly: policy.readOnly };
  });
}

export function buildOpenAITools(runtimeTools: RuntimeTool[]) {
  return runtimeTools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.key.replace(/[^a-zA-Z0-9_]/g, "_"),
      description: `${tool.description}. Approval mode: ${tool.approvalMode}.`,
      parameters: tool.schema
    }
  }));
}

export function resolveToolByOpenAIName(runtimeTools: RuntimeTool[], fnName: string) {
  return runtimeTools.find((t) => t.key.replace(/[^a-zA-Z0-9_]/g, "_") === fnName);
}

export const finalResponseExtractionSchema = z.object({
  text: z.string(),
  cards: z.array(z.any()).default([])
});
