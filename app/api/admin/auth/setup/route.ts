import { NextRequest, NextResponse } from "next/server";
import { createAdmin, createSession, hasAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") || "");
  if (password.length < 8) return NextResponse.redirect(new URL("/admin", req.url));
  if (!(await hasAdmin())) await createAdmin(password);
  await createSession();
  return NextResponse.redirect(new URL("/admin", req.url));
}
