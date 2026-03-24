import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { providerSchema } from "@/lib/schemas";
import { ok, err } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const g = await guardAdmin();
  if (g) return g;
  const provider = await db.providerSettings.findFirst({ orderBy: { updatedAt: "desc" } });
  return ok(provider || {});
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  try {
    const data = providerSchema.parse(await req.json());
    return ok(await db.providerSettings.create({ data }));
  } catch (e) {
    return err((e as Error).message);
  }
}

export async function PUT(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  try {
    const data = providerSchema.partial().parse(await req.json());
    const existing = await db.providerSettings.findFirst({ orderBy: { updatedAt: "desc" } });
    if (!existing) return ok(await db.providerSettings.create({ data: data as any }));
    return ok(await db.providerSettings.update({ where: { id: existing.id }, data }));
  } catch (e) {
    return err((e as Error).message);
  }
}
