import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

const defaults = {
  systemPrompt: "You are a helpful company assistant.",
  fallbackBehavior: "Explain limitations and propose next action.",
  toolInstructions: "Use tools when needed.",
  brandTone: "Professional and clear.",
  safetyInstructions: "Never fabricate unavailable data.",
  cardFirst: true
};

export async function GET() {
  const g = await guardAdmin(); if (g) return g;
  const item = await db.assistantSettings.findFirst();
  return ok(item || defaults);
}

export async function PUT(req: NextRequest) {
  const g = await guardAdmin(); if (g) return g;
  const data = await req.json();
  const item = await db.assistantSettings.findFirst();
  if (!item) return ok(await db.assistantSettings.create({ data: { ...defaults, ...data } }));
  return ok(await db.assistantSettings.update({ where: { id: item.id }, data }));
}
