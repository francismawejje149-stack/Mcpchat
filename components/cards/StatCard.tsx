import { Card } from "@/components/ui/card";
import { CardPayload } from "./types";
export function StatCard({ card, onOpen }: { card: CardPayload; onOpen: () => void }) {
  return <Card className="min-w-[280px]"><h4 className="font-semibold">{card.title}</h4><div className="mt-2 grid grid-cols-2 gap-2">{card.items?.map((s,idx)=><div key={idx} className="rounded-xl bg-slate-900 p-3 text-white"><div className="text-xl font-bold">{s.value}</div><div className="text-xs opacity-80">{s.label}</div></div>)}</div><button className="mt-3 text-xs text-brand" onClick={onOpen}>Inspect</button></Card>;
}
