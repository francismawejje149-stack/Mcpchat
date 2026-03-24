import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { getAllRuntimeTools } from "@/lib/tools";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const g = await guardAdmin(); if (g) return g;
  return ok({ items: await getAllRuntimeTools() });
}

export async function PUT(req: NextRequest) {
  const g = await guardAdmin(); if (g) return g;
  const body = await req.json();
  return ok(await db.toolApprovalPolicy.upsert({ where: { toolKey: body.toolKey }, create: body, update: body }));
}
