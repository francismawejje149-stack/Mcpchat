import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() { const g = await guardAdmin(); if (g) return g; return ok({ items: await db.mCPServer.findMany({ include: { tools: true }, orderBy: { updatedAt: "desc" } }) }); }
export async function POST(req: NextRequest) { const g = await guardAdmin(); if (g) return g; return ok(await db.mCPServer.create({ data: await req.json() })); }
