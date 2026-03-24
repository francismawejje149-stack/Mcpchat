import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { collectionFieldSchema } from "@/lib/schemas";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  const data = collectionFieldSchema.parse(await req.json());
  return ok(await db.collectionField.create({ data: { ...data, collectionId: params.id } }));
}
