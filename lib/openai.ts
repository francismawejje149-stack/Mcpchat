import OpenAI from "openai";

export type ProviderConfig = {
  baseUrl: string;
  apiKey?: string | null;
  defaultHeaders?: Record<string, string> | null;
  model: string;
};

export function getOpenAIClient(provider: ProviderConfig) {
  return new OpenAI({
    apiKey: provider.apiKey || "no-key",
    baseURL: provider.baseUrl,
    defaultHeaders: provider.defaultHeaders ?? undefined
  });
}

export async function testProviderConnection(provider: ProviderConfig) {
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
