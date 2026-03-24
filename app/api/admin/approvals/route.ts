import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const g = await guardAdmin(); if (g) return g;
  const items = await db.approvalRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return ok({ items });
}
