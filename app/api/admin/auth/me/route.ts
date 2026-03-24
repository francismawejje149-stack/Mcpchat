import { ok } from "@/lib/http";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  return ok({ authenticated: await requireAdminSession() });
}
