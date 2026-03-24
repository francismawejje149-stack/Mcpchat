import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const g = await guardAdmin(); if (g) return g;
  const profile = await db.companyProfile.findFirst();
  return ok(profile || {});
}

export async function PUT(req: NextRequest) {
  const g = await guardAdmin(); if (g) return g;
  const data = await req.json();
  const existing = await db.companyProfile.findFirst();
  if (!existing) return ok(await db.companyProfile.create({ data }));
  return ok(await db.companyProfile.update({ where: { id: existing.id }, data }));
}
