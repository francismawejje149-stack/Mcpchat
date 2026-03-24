import { db } from "@/lib/db";
import { ok, err } from "@/lib/http";
import { discoverMcpTools } from "@/lib/mcp";
import { guardAdmin } from "@/lib/admin-guard";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  const server = await db.mCPServer.findUnique({ where: { id: params.id } });
  if (!server) return err("Not found", 404);
  try {
    const tools = await discoverMcpTools(server);
    for (const t of tools) {
      await db.mCPTool.upsert({
        where: { serverId_toolName: { serverId: server.id, toolName: t.name } },
        create: {
          serverId: server.id,
          toolName: t.name,
          label: t.label || t.name,
          description: t.description,
          inputSchema: t.inputSchema || t.parameters || {},
          outputHints: t.outputHints || {},
          approvalMode: server.defaultApprovalMode
        },
        update: {
          label: t.label || t.name,
          description: t.description,
          inputSchema: t.inputSchema || t.parameters || {},
          outputHints: t.outputHints || {},
          lastSyncedAt: new Date()
        }
      });
    }
    return ok({ success: true });
  } catch (e) { return err((e as Error).message, 500); }
}
