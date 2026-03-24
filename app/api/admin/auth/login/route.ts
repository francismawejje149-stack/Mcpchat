import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") || "");
  const ok = await verifyAdmin(password);
  if (ok) await createSession();
  return NextResponse.redirect(new URL("/admin", req.url));
}
