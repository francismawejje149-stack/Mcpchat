import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { collectionSchema } from "@/lib/schemas";
import { ok, err } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const g = await guardAdmin(); if (g) return g;
  return ok({ items: await db.collection.findMany({ include: { fields: true, records: true }, orderBy: { updatedAt: "desc" } }) });
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin(); if (g) return g;
  try {
    const data = collectionSchema.parse(await req.json());
    return ok(await db.collection.create({ data }));
  } catch (e) {
    return err((e as Error).message);
  }
}
