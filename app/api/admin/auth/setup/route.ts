import { NextRequest, NextResponse } from "next/server";
import { createAdmin, createSession, hasAdmin } from "@/lib/auth";

const POST_REDIRECT_STATUS = 303;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") || "");
  if (password.length < 8) {
    return NextResponse.redirect(new URL("/admin", req.url), POST_REDIRECT_STATUS);
  }

  if (await hasAdmin()) {
    return NextResponse.redirect(new URL("/admin", req.url), POST_REDIRECT_STATUS);
  }

  await createAdmin(password);
  await createSession();
  return NextResponse.redirect(new URL("/admin", req.url), POST_REDIRECT_STATUS);
}
