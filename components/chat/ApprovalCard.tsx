"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ApprovalCard({ approvalRequest, onAction }: { approvalRequest: { id: string; toolKey: string; args: any; reason?: string }; onAction: (action: "approve" | "reject") => void }) {
  return (
    <Card className="mt-3 border-amber-300 bg-amber-50">
      <div className="text-sm font-semibold">Approval Required</div>
      <p className="text-sm">Tool: {approvalRequest.toolKey}</p>
      <p className="text-xs text-slate-600">{approvalRequest.reason}</p>
      <pre className="mt-2 max-h-28 overflow-auto rounded bg-white p-2 text-xs">{JSON.stringify(approvalRequest.args, null, 2)}</pre>
      <div className="mt-2 flex gap-2">
        <Button onClick={() => onAction("approve")} className="bg-emerald-600 hover:bg-emerald-500">Approve</Button>
        <Button onClick={() => onAction("reject")} className="bg-rose-600 hover:bg-rose-500">Cancel</Button>
      </div>
    </Card>
  );
}
