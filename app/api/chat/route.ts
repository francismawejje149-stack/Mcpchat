import { NextRequest } from "next/server";
import { chatInputSchema } from "@/lib/schemas";
import { runAgent } from "@/lib/agent";
import { ok, err } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const body = chatInputSchema.parse(await req.json());
    const sessionId = body.sessionId || crypto.randomUUID();

    if (body.approvalRequestId || body.approvalAction) {
      return err("Approval workflow is disabled in JSON mode", 400);
    }

    const response = await runAgent(sessionId, body.message);
    return ok({ sessionId, ...response });
  } catch (e) {
    return err((e as Error).message, 500);
  }
}
