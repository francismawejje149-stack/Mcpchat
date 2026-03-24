import { NextRequest } from "next/server";
import { resolveApproval } from "@/lib/approvals";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guardAdmin(); if (g) return g;
  const { action } = await req.json();
  return ok(await resolveApproval(params.id, action));
}
