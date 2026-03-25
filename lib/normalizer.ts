import { assistantResponseSchema } from "./schemas";

type AnyObj = Record<string, any>;

function inferCardType(items: AnyObj[]): "grid" | "profile" | "list" | "stat" | "map" | "generic" {
  if (!items.length) return "generic";
  const sample = items[0];
  if ("value" in sample && "label" in sample) return "stat";
  if ("latitude" in sample || "longitude" in sample || "address" in sample) return "map";
  if ("role" in sample || "email" in sample || "phone" in sample) return "profile";
  if (Object.keys(sample).length <= 3) return "list";
  return "grid";
}

export function tryParseAssistantJson(text: string | null | undefined) {
  if (!text) return null;
  const raw = text.trim();
  const jsonCandidate = raw.startsWith("{") ? raw : raw.slice(raw.indexOf("{"));
  try {
    const parsed = JSON.parse(jsonCandidate);
    const validated = assistantResponseSchema.safeParse(parsed);
    if (validated.success) return validated.data;
  } catch {
    return null;
  }
  return null;
}

export function normalizeToolResultToCards(toolName: string, result: unknown, preferredType?: string | null) {
  const obj = (result ?? {}) as AnyObj;
  const items = Array.isArray(obj.items) ? obj.items : Array.isArray(obj.data) ? obj.data : [];
  const cardType = (preferredType as any) || inferCardType(items);
  return [
    {
      type: cardType,
      title: obj.collection || obj.title || toolName,
      subtitle: obj.summary || obj.subtitle || `Result from ${toolName}`,
      items: items.slice(0, 12),
      detail: obj
    }
  ];
}

export function normalizeFinalAssistantResponse(messageContent: string | null | undefined, fallbackCards: any[]) {
  const parsed = tryParseAssistantJson(messageContent);
  if (parsed) return parsed;
  return {
    text: (messageContent || "I completed the request.").trim(),
    cards: fallbackCards,
    toolStatus: []
  };
}
