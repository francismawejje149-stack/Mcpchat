import { Card } from "@/components/ui/card";
import { CardPayload } from "./types";
export function ProfileCard({ card, onOpen }: { card: CardPayload; onOpen: () => void }) {
  return <Card className="min-w-[280px]"><h4 className="font-semibold">{card.title}</h4>{card.items?.slice(0,3).map((p,idx)=><div key={idx} className="mt-2 rounded-lg border p-2"><div className="font-medium">{p.name||p.title}</div><div className="text-xs text-slate-500">{p.role||p.subtitle}</div></div>)}<button className="mt-3 text-xs text-brand" onClick={onOpen}>Open</button></Card>;
}
