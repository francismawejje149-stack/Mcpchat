import { db } from "@/lib/db";
import { ok, err } from "@/lib/http";
import { testProviderConnection } from "@/lib/openai";
import { guardAdmin } from "@/lib/admin-guard";

export async function POST() {
  const g = await guardAdmin();
  if (g) return g;
  const provider = await db.providerSettings.findFirst({ where: { enabled: true }, orderBy: { updatedAt: "desc" } });
  if (!provider) return err("No provider configured", 404);
  try {
    return ok(await testProviderConnection(provider));
  } catch (e) {
    await db.toolExecutionLog.create({ data: { toolKey: "provider.test", success: false, error: (e as Error).message } });
    return err((e as Error).message, 500);
  }
}
