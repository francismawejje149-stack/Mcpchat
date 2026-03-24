import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/http";
import { executeMcpTool } from "@/lib/mcp";
import { guardAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  const tool = await db.mCPTool.findUnique({ where: { id: params.id }, include: { server: true } });
  if (!tool) return err("Not found", 404);
  const body = await req.json();
  try { return ok(await executeMcpTool(tool.server, tool.toolName, body.input || {})); } catch (e) { return err((e as Error).message, 500); }
}
