import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

const POST_REDIRECT_STATUS = 303;

export async function POST(req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/admin", req.url), POST_REDIRECT_STATUS);
}
