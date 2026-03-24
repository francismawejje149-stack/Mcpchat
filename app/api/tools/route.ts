import { getAllRuntimeTools } from "@/lib/tools";
import { ok, err } from "@/lib/http";

export async function GET() {
  try {
    const tools = await getAllRuntimeTools();
    return ok({ items: tools.map((t) => ({ key: t.key, label: t.label, description: t.description, schema: t.schema, approvalMode: t.approvalMode, sideEffect: t.sideEffect, readOnly: t.readOnly, cardRenderer: t.cardRenderer })) });
  } catch (e) {
    return err((e as Error).message, 500);
  }
}
