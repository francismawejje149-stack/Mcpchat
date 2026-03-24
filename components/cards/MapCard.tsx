import { Card } from "@/components/ui/card";
import { CardPayload } from "./types";
export function MapCard({ card, onOpen }: { card: CardPayload; onOpen: () => void }) {
  return <Card className="min-w-[300px]"><h4 className="font-semibold">{card.title}</h4><div className="mt-2 rounded-xl bg-sky-50 p-3 text-sm">{card.subtitle || "Location overview"}</div><ul className="mt-2 text-sm">{card.items?.slice(0,4).map((i,idx)=><li key={idx}>{i.address||i.name}</li>)}</ul><button className="mt-3 text-xs text-brand" onClick={onOpen}>Open map details</button></Card>;
}
