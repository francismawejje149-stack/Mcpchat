import { Card } from "@/components/ui/card";
import { CardPayload } from "./types";
export function GenericCard({ card, onOpen }: { card: CardPayload; onOpen: () => void }) {
  return <Card className="min-w-[280px]"><h4 className="font-semibold">{card.title || "Details"}</h4><p className="mt-2 text-sm text-slate-600">{card.subtitle || "Structured result"}</p><pre className="mt-2 max-h-36 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(card.items?.slice(0,3) ?? card.detail ?? {}, null, 2)}</pre><button className="mt-3 text-xs text-brand" onClick={onOpen}>Expand</button></Card>;
}
