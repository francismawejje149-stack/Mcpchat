import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string; recordId: string } }) {
  const g = await guardAdmin(); if (g) return g;
  const data = await req.json();
  const record = await db.collectionRecord.findUnique({ where: { id: params.recordId } });
  if (!record || record.collectionId !== params.id) return err("Record not found", 404);
  return ok(await db.collectionRecord.update({ where: { id: params.recordId }, data: { data } }));
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; recordId: string } }) {
  const g = await guardAdmin(); if (g) return g;
  const record = await db.collectionRecord.findUnique({ where: { id: params.recordId } });
  if (!record || record.collectionId !== params.id) return err("Record not found", 404);
  await db.collectionRecord.delete({ where: { id: params.recordId } });
  return ok({ success: true });
}
