import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const g = await guardAdmin(); if (g) return g;
  const [toolLogs, approvals, messages] = await Promise.all([
    db.toolExecutionLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.approvalRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.chatMessage.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
  ]);
  return ok({ items: [...toolLogs, ...approvals, ...messages].sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 100) });
}
