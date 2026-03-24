import { Card } from "@/components/ui/card";
import { CardPayload } from "./types";
export function GridCard({ card, onOpen }: { card: CardPayload; onOpen: () => void }) {
  return <Card className="min-w-[280px] cursor-pointer" ><h4 className="font-semibold">{card.title}</h4><div className="mt-3 grid grid-cols-2 gap-2 text-sm">{card.items?.slice(0,6).map((i,idx)=><div key={idx} className="rounded-lg bg-slate-50 p-2">{i.title||i.name||JSON.stringify(i)}</div>)}</div><button className="mt-3 text-xs text-brand" onClick={onOpen}>View details</button></Card>;
}
