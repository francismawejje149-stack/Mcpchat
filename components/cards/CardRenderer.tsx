"use client";
import { motion } from "framer-motion";
import { CardPayload } from "./types";
import { GridCard } from "./GridCard";
import { ProfileCard } from "./ProfileCard";
import { ListCard } from "./ListCard";
import { StatCard } from "./StatCard";
import { MapCard } from "./MapCard";
import { GenericCard } from "./GenericCard";

export function CardRenderer({ cards, onOpen }: { cards: CardPayload[]; onOpen: (c: CardPayload) => void }) {
  return (
    <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
      {cards.map((card, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {card.type === "grid" && <GridCard card={card} onOpen={() => onOpen(card)} />}
          {card.type === "profile" && <ProfileCard card={card} onOpen={() => onOpen(card)} />}
          {card.type === "list" && <ListCard card={card} onOpen={() => onOpen(card)} />}
          {card.type === "stat" && <StatCard card={card} onOpen={() => onOpen(card)} />}
          {card.type === "map" && <MapCard card={card} onOpen={() => onOpen(card)} />}
          {card.type === "generic" && <GenericCard card={card} onOpen={() => onOpen(card)} />}
        </motion.div>
      ))}
    </div>
  );
}
