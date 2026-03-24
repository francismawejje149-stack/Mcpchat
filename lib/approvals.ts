import { db } from "./db";

export async function createApprovalRequest(sessionId: string, toolKey: string, args: unknown, reason?: string) {
  return db.approvalRequest.create({
    data: {
      sessionId,
      toolKey,
      args: args as object,
      reason,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10)
    }
  });
}

export async function resolveApproval(id: string, action: "approve" | "reject") {
  return db.approvalRequest.update({
    where: { id },
    data: {
      status: action === "approve" ? "approved" : "rejected",
      processedAt: new Date()
    }
  });
}
