import { db } from "@/lib/db";
import { ok, err } from "@/lib/http";
import { discoverMcpTools } from "@/lib/mcp";
import { guardAdmin } from "@/lib/admin-guard";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  const server = await db.mCPServer.findUnique({ where: { id: params.id } });
  if (!server) return err("Not found", 404);
  try { return ok({ items: await discoverMcpTools(server) }); } catch (e) { return err((e as Error).message, 500); }
}
