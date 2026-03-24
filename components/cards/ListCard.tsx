import { Card } from "@/components/ui/card";
import { CardPayload } from "./types";
export function ListCard({ card, onOpen }: { card: CardPayload; onOpen: () => void }) {
  return <Card className="min-w-[280px]"><h4 className="font-semibold">{card.title}</h4><ul className="mt-2 space-y-1 text-sm">{card.items?.slice(0,8).map((i,idx)=><li key={idx} className="rounded-md bg-slate-50 p-2">{i.title||i.name||String(i)}</li>)}</ul><button className="mt-3 text-xs text-brand" onClick={onOpen}>View all</button></Card>;
}
