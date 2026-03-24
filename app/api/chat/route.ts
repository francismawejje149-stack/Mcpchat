import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { chatInputSchema } from "@/lib/schemas";
import { runAgent } from "@/lib/agent";
import { resolveApproval } from "@/lib/approvals";
import { ok, err } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const body = chatInputSchema.parse(await req.json());
    const session = body.sessionId
      ? await db.chatSession.upsert({ where: { id: body.sessionId }, create: { id: body.sessionId }, update: {} })
      : await db.chatSession.create({ data: {} });

    if (body.approvalRequestId && body.approvalAction) {
      const request = await db.approvalRequest.findUnique({ where: { id: body.approvalRequestId } });
      if (!request || request.sessionId !== session.id) return err("Approval request not found", 404);
      if (request.status !== "pending") return err("Approval request already resolved", 400);
      if (request.expiresAt < new Date()) return err("Approval request expired", 400);

      await resolveApproval(body.approvalRequestId, body.approvalAction);
      if (body.approvalAction === "reject") {
        return ok({ sessionId: session.id, text: "Understood — I cancelled that action.", cards: [], toolStatus: ["Action cancelled"] });
      }

      const response = await runAgent(session.id, `Continue and execute approved tool ${request.toolKey}`, {
        approvedRequestId: body.approvalRequestId,
        approvedToolKey: request.toolKey
      });
      return ok({ sessionId: session.id, ...response });
    }

    const response = await runAgent(session.id, body.message);
    return ok({ sessionId: session.id, ...response });
  } catch (e) {
    return err((e as Error).message, 500);
  }
}
