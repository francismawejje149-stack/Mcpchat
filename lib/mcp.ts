import { MCPServer } from "@prisma/client";

function buildHeaders(server: MCPServer): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const custom = (server.headers as Record<string, string> | null) ?? {};
  Object.assign(headers, custom);
  if (server.authToken) headers.Authorization = `Bearer ${server.authToken}`;
  return headers;
}

export async function testMcpServer(server: MCPServer) {
  if (!server.endpointUrl) throw new Error("Missing endpoint URL");
  const start = Date.now();
  const res = await fetch(`${server.endpointUrl.replace(/\/$/, "")}/health`, {
    method: "GET",
    headers: buildHeaders(server)
  });
  const text = await res.text();
  return { ok: res.ok, latencyMs: Date.now() - start, body: text.slice(0, 500) };
}

export async function discoverMcpTools(server: MCPServer) {
  if (!server.endpointUrl) throw new Error("Missing endpoint URL");
  const res = await fetch(`${server.endpointUrl.replace(/\/$/, "")}/tools`, {
    method: "GET",
    headers: buildHeaders(server)
  });
  if (!res.ok) throw new Error(`Discover failed ${res.status}`);
  const json = await res.json();
  return Array.isArray(json.tools) ? json.tools : json;
}

export async function executeMcpTool(server: MCPServer, toolName: string, input: unknown) {
  if (server.transport === "stdio") {
    throw new Error("stdio transport is not supported in serverless route runtime yet.");
  }
  if (!server.endpointUrl) throw new Error("Missing endpoint URL");
  const res = await fetch(`${server.endpointUrl.replace(/\/$/, "")}/tools/${toolName}`, {
    method: "POST",
    headers: buildHeaders(server),
    body: JSON.stringify({ input })
  });
  const json = await res.json().catch(() => ({ raw: null }));
  if (!res.ok) throw new Error(`Tool call failed ${res.status}`);
  return json;
}
