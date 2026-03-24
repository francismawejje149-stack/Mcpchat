import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() { const g = await guardAdmin(); if (g) return g; return ok({ items: await db.cardTemplate.findMany({ orderBy: { updatedAt: "desc" } }) }); }
export async function POST(req: NextRequest) { const g = await guardAdmin(); if (g) return g; return ok(await db.cardTemplate.create({ data: await req.json() })); }
export async function PUT(req: NextRequest) { const g = await guardAdmin(); if (g) return g; const data = await req.json(); return ok(await db.cardTemplate.update({ where: { id: data.id }, data })); }
export async function DELETE(req: NextRequest) { const g = await guardAdmin(); if (g) return g; const { id } = await req.json(); await db.cardTemplate.delete({ where: { id } }); return ok({ success: true }); }
