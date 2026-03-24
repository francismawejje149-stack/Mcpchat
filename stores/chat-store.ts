"use client";
import { create } from "zustand";
import { CardPayload } from "@/components/cards/types";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: CardPayload[];
  toolStatus?: string[];
  approvalRequest?: { id: string; toolKey: string; args: any; reason?: string };
};

type State = {
  sessionId?: string;
  messages: Msg[];
  pending: boolean;
  addMessage: (m: Msg) => void;
  setPending: (v: boolean) => void;
  setSessionId: (id: string) => void;
};

export const useChatStore = create<State>((set) => ({
  messages: [],
  pending: false,
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setPending: (v) => set({ pending: v }),
  setSessionId: (sessionId) => set({ sessionId })
}));
