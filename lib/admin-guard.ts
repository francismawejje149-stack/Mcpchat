import { requireAdminSession } from "./auth";
import { err } from "./http";

export async function guardAdmin() {
  const ok = await requireAdminSession();
  if (!ok) return err("Unauthorized", 401);
  return null;
}
