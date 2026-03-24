import OpenAI from "openai";
import { ProviderSettings } from "@prisma/client";

export function getOpenAIClient(provider: ProviderSettings) {
  return new OpenAI({
    apiKey: provider.apiKey || "no-key",
    baseURL: provider.baseUrl,
    defaultHeaders: (provider.defaultHeaders as Record<string, string> | null) ?? undefined
  });
}

export async function testProviderConnection(provider: ProviderSettings) {
  const client = getOpenAIClient(provider);
  const start = Date.now();
  const res = await client.chat.completions.create({
    model: provider.model,
    messages: [{ role: "user", content: "reply with the word OK" }],
    max_tokens: 10
  });
  return {
    ok: true,
    latencyMs: Date.now() - start,
    response: res.choices[0]?.message?.content?.trim() || ""
  };
}
