"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "@/stores/chat-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { ApprovalCard } from "./ApprovalCard";
import { Card } from "@/components/ui/card";
import { CardPayload } from "@/components/cards/types";

export function ChatShell({ brand }: { brand: { companyName: string; logoUrl?: string | null; welcomeMessage: string } }) {
  const [text, setText] = useState("");
  const [openCard, setOpenCard] = useState<CardPayload | null>(null);
  const { messages, addMessage, pending, setPending, sessionId, setSessionId } = useChatStore();

  const send = async (message: string, approvalRequestId?: string, approvalAction?: "approve" | "reject") => {
    if (!message && !approvalRequestId) return;
    if (!approvalRequestId) addMessage({ id: crypto.randomUUID(), role: "user", text: message });
    setPending(true);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, message: message || "Approval decision", approvalRequestId, approvalAction }) });
    const json = await res.json();
    if (!res.ok) {
      addMessage({ id: crypto.randomUUID(), role: "assistant", text: json.error || "Request failed." });
      setPending(false);
      return;
    }
    if (!sessionId && json.sessionId) setSessionId(json.sessionId);
    addMessage({ id: crypto.randomUUID(), role: "assistant", text: json.text, cards: json.cards, toolStatus: json.toolStatus, approvalRequest: json.approvalRequest });
    setPending(false);
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-teal-50">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-4">
        {brand.logoUrl ? <img src={brand.logoUrl} alt="logo" className="h-8 w-8 rounded" /> : <div className="h-8 w-8 rounded bg-brand" />}
        <div>
          <h1 className="font-semibold">{brand.companyName}</h1>
          <p className="text-xs text-slate-500">Company Assistant</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-auto px-4 pb-28">
        <Card className="bg-white/70">{brand.welcomeMessage}</Card>
        {messages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={m.role === "user" ? "ml-auto max-w-2xl" : "max-w-3xl"}>
            <Card className={m.role === "user" ? "bg-brand text-white" : "bg-white"}>
              <p className="text-sm">{m.text}</p>
              {!!m.toolStatus?.length && <p className="mt-2 text-xs text-slate-500">{m.toolStatus.join(" · ")}</p>}
              {!!m.cards?.length && <CardRenderer cards={m.cards} onOpen={(c) => setOpenCard(c)} />}
              {m.approvalRequest && <ApprovalCard approvalRequest={m.approvalRequest} onAction={(action) => send("", m.approvalRequest?.id, action)} />}
            </Card>
          </motion.div>
        ))}
      </main>
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/90 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-2">
          <Input placeholder="Ask about products, offices, apps..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(text)} />
          <Button disabled={pending} onClick={() => { send(text); setText(""); }}>{pending ? "Working..." : "Send"}</Button>
        </div>
      </div>

      {openCard && (
        <div className="fixed inset-0 grid place-items-center bg-black/40 p-4" onClick={() => setOpenCard(null)}>
          <Card className="max-h-[80vh] w-full max-w-2xl overflow-auto" >
            <h3 className="text-lg font-semibold">{openCard.title || "Detail"}</h3>
            <pre className="mt-3 rounded bg-slate-50 p-3 text-xs">{JSON.stringify(openCard, null, 2)}</pre>
          </Card>
        </div>
      )}
    </div>
  );
}
