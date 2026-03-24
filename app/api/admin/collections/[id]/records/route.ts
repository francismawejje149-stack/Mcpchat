import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  const data = await req.json();
  return ok(await db.collectionRecord.create({ data: { collectionId: params.id, data } }));
}
