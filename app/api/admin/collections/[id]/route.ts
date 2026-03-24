import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  return ok(await db.collection.findUnique({ where: { id: params.id }, include: { fields: true, records: true } }));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  return ok(await db.collection.update({ where: { id: params.id }, data: await req.json() }));
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  await db.collection.delete({ where: { id: params.id } });
  return ok({ success: true });
}
