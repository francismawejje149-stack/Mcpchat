import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "./db";

const COOKIE = "admin_session";

export async function hasAdmin() {
  const count = await db.adminUser.count();
  return count > 0;
}

export async function createAdmin(password: string) {
  const hash = await bcrypt.hash(password, 12);
  await db.adminUser.create({ data: { passwordHash: hash } });
}

export async function verifyAdmin(password: string) {
  const admin = await db.adminUser.findFirst();
  if (!admin) return false;
  return bcrypt.compare(password, admin.passwordHash);
}

export async function createSession() {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await db.adminSession.create({ data: { id, expiresAt } });
  cookies().set(COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearSession() {
  const id = cookies().get(COOKIE)?.value;
  if (id) await db.adminSession.deleteMany({ where: { id } });
  cookies().delete(COOKIE);
}

export async function requireAdminSession() {
  const id = cookies().get(COOKIE)?.value;
  if (!id) return false;
  const session = await db.adminSession.findFirst({ where: { id, expiresAt: { gt: new Date() } } });
  return Boolean(session);
}
