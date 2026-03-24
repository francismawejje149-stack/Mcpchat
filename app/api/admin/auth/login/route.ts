import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyAdmin } from "@/lib/auth";

const POST_REDIRECT_STATUS = 303;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") || "");
  const ok = await verifyAdmin(password);
  if (ok) await createSession();
  return NextResponse.redirect(new URL("/admin", req.url), POST_REDIRECT_STATUS);
}
