"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const tabs = ["company", "provider", "collections", "mcp", "templates", "mappings", "tools", "settings", "logs"] as const;

export function AdminConsole() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("company");
  const [provider, setProvider] = useState<any>({ label: "", baseUrl: "", apiKey: "", model: "", enabled: true });
  const [company, setCompany] = useState<any>({ companyName: "", logoUrl: "", brandColor: "#0ea5e9", accentColor: "#14b8a6", welcomeMessage: "" });
  const [settings, setSettings] = useState<any>({ systemPrompt: "" });
  const [collections, setCollections] = useState<any[]>([]);
  const [mcp, setMcp] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  const [newCollection, setNewCollection] = useState({ name: "", slug: "", description: "", enabled: true });
  const [newMcp, setNewMcp] = useState({ name: "", endpointUrl: "", transport: "http", enabled: true, defaultApprovalMode: "ask" });

  const load = async () => {
    const [p, c, s, col, m, l, t, q, tr, a] = await Promise.all([
      fetch("/api/admin/provider").then((r) => r.json()),
      fetch("/api/admin/company").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/collections").then((r) => r.json()),
      fetch("/api/admin/mcp").then((r) => r.json()),
      fetch("/api/admin/logs").then((r) => r.json()),
      fetch("/api/admin/card-templates").then((r) => r.json()),
      fetch("/api/admin/question-mappings").then((r) => r.json()),
      fetch("/api/admin/tool-registry").then((r) => r.json()),
      fetch("/api/admin/approvals").then((r) => r.json())
    ]);

    if (p) setProvider(p);
    if (c) setCompany(c);
    if (s) setSettings(s);
    setCollections(col.items || []);
    setMcp(m.items || []);
    setLogs(l.items || []);
    setTemplates(t.items || []);
    setMappings(q.items || []);
    setTools(tr.items || []);
    setApprovals(a.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const tabButtonClass = (tab: (typeof tabs)[number]) =>
    `rounded-xl px-3 py-1 text-sm ${activeTab === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`;

  const groupedTools = useMemo(() => {
    const internal = tools.filter((t: any) => String(t.key || "").startsWith("internal."));
    const mcpTools = tools.filter((t: any) => String(t.key || "").startsWith("mcp."));
    return { internal, mcpTools };
  }, [tools]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4">
      <h1 className="text-2xl font-semibold">Admin Console</h1>
      {msg && <Card>{msg}</Card>}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab} className={tabButtonClass(tab)} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "company" && (
        <Card>
          <h2 className="mb-3 font-semibold">Company Profile</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={company.companyName || ""} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} placeholder="Company name" />
            <Input value={company.logoUrl || ""} onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })} placeholder="Logo URL" />
            <Input value={company.brandColor || ""} onChange={(e) => setCompany({ ...company, brandColor: e.target.value })} placeholder="Brand color" />
            <Input value={company.accentColor || ""} onChange={(e) => setCompany({ ...company, accentColor: e.target.value })} placeholder="Accent color" />
            <Textarea className="md:col-span-2" value={company.welcomeMessage || ""} onChange={(e) => setCompany({ ...company, welcomeMessage: e.target.value })} placeholder="Welcome message" />
          </div>
          <Button className="mt-3" onClick={async () => { await fetch("/api/admin/company", { method: "PUT", body: JSON.stringify(company) }); setMsg("Company saved"); }}>Save Company</Button>
        </Card>
      )}

      {activeTab === "provider" && (
        <Card>
          <h2 className="mb-3 font-semibold">Provider Settings</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={provider.label || ""} onChange={(e) => setProvider({ ...provider, label: e.target.value })} placeholder="Provider label" />
            <Input value={provider.model || ""} onChange={(e) => setProvider({ ...provider, model: e.target.value })} placeholder="Model" />
            <Input value={provider.baseUrl || ""} onChange={(e) => setProvider({ ...provider, baseUrl: e.target.value })} placeholder="Base URL" />
            <Input value={provider.apiKey || ""} onChange={(e) => setProvider({ ...provider, apiKey: e.target.value })} placeholder="API key" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={async () => { await fetch("/api/admin/provider", { method: "PUT", body: JSON.stringify(provider) }); setMsg("Provider saved"); }}>Save Provider</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500" onClick={async () => { const r = await fetch("/api/admin/test-connection", { method: "POST" }); const j = await r.json(); setMsg(JSON.stringify(j)); }}>Test Connection</Button>
          </div>
        </Card>
      )}

      {activeTab === "collections" && (
        <Card>
          <h2 className="mb-3 font-semibold">Collections Manager</h2>
          <div className="grid gap-2 md:grid-cols-4">
            <Input value={newCollection.name} onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })} placeholder="Name" />
            <Input value={newCollection.slug} onChange={(e) => setNewCollection({ ...newCollection, slug: e.target.value })} placeholder="slug" />
            <Input value={newCollection.description} onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })} placeholder="Description" />
            <Button onClick={async () => { await fetch("/api/admin/collections", { method: "POST", body: JSON.stringify(newCollection) }); setMsg("Collection added"); setNewCollection({ name: "", slug: "", description: "", enabled: true }); load(); }}>Add</Button>
          </div>
          <ul className="mt-3 space-y-2 text-sm">{collections.map((c) => <li key={c.id} className="rounded bg-slate-50 p-2">{c.name} ({c.slug}) · fields: {c.fields?.length || 0} · records: {c.records?.length || 0}</li>)}</ul>
        </Card>
      )}

      {activeTab === "mcp" && (
        <Card>
          <h2 className="mb-3 font-semibold">MCP Apps / Servers</h2>
          <div className="grid gap-2 md:grid-cols-4">
            <Input value={newMcp.name} onChange={(e) => setNewMcp({ ...newMcp, name: e.target.value })} placeholder="Server name" />
            <Input value={newMcp.endpointUrl} onChange={(e) => setNewMcp({ ...newMcp, endpointUrl: e.target.value })} placeholder="Endpoint URL" />
            <Input value={newMcp.transport} onChange={(e) => setNewMcp({ ...newMcp, transport: e.target.value })} placeholder="transport" />
            <Button onClick={async () => { await fetch("/api/admin/mcp", { method: "POST", body: JSON.stringify(newMcp) }); setMsg("MCP server added"); setNewMcp({ name: "", endpointUrl: "", transport: "http", enabled: true, defaultApprovalMode: "ask" }); load(); }}>Add</Button>
          </div>
          <div className="mt-3 space-y-2">{mcp.map((s) => <div key={s.id} className="rounded bg-slate-50 p-3 text-sm"><div className="font-medium">{s.name} · {s.transport}</div><div className="mt-2 flex flex-wrap gap-2"><Button className="bg-emerald-600 hover:bg-emerald-500" onClick={async () => { const r = await fetch(`/api/admin/mcp/${s.id}/test`, { method: "POST" }); setMsg(JSON.stringify(await r.json())); }}>Test</Button><Button className="bg-indigo-600 hover:bg-indigo-500" onClick={async () => { const r = await fetch(`/api/admin/mcp/${s.id}/discover`, { method: "POST" }); setMsg(`Discovered: ${JSON.stringify(await r.json())}`); }}>Discover</Button><Button onClick={async () => { await fetch(`/api/admin/mcp/${s.id}/sync-tools`, { method: "POST" }); setMsg("Tools synced"); load(); }}>Sync Tools</Button></div></div>)}</div>
        </Card>
      )}

      {activeTab === "templates" && <Card><h2 className="font-semibold">Card Templates</h2><div className="mt-2 text-sm text-slate-600">Available: {templates.length}</div><pre className="mt-2 rounded bg-slate-50 p-2 text-xs">{JSON.stringify(templates, null, 2)}</pre></Card>}
      {activeTab === "mappings" && <Card><h2 className="font-semibold">Question Mappings</h2><div className="mt-2 text-sm text-slate-600">Configured: {mappings.length}</div><pre className="mt-2 rounded bg-slate-50 p-2 text-xs">{JSON.stringify(mappings, null, 2)}</pre></Card>}
      {activeTab === "tools" && <Card><h2 className="font-semibold">Tool Registry</h2><div className="mt-2 grid gap-3 md:grid-cols-2"><div><h3 className="font-medium">Internal</h3><pre className="rounded bg-slate-50 p-2 text-xs">{JSON.stringify(groupedTools.internal, null, 2)}</pre></div><div><h3 className="font-medium">MCP</h3><pre className="rounded bg-slate-50 p-2 text-xs">{JSON.stringify(groupedTools.mcpTools, null, 2)}</pre></div></div></Card>}

      {activeTab === "settings" && (
        <Card>
          <h2 className="mb-3 font-semibold">Assistant Prompt / Safety</h2>
          <Textarea value={settings.systemPrompt || ""} onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })} rows={8} />
          <Button className="mt-3" onClick={async () => { await fetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) }); setMsg("Settings saved"); }}>Save Prompt</Button>
        </Card>
      )}

      {activeTab === "logs" && (
        <Card>
          <h2 className="font-semibold">Logs / Debug</h2>
          <p className="mt-1 text-xs text-slate-500">Pending approvals: {approvals.filter((a) => a.status === "pending").length}</p>
          <div className="mt-2 max-h-72 overflow-auto space-y-2 text-xs">
            {approvals.slice(0, 20).map((a) => <pre key={a.id} className="rounded border border-amber-200 bg-amber-50 p-2">{JSON.stringify(a, null, 2)}</pre>)}
            {logs.map((l) => <pre key={l.id} className="rounded bg-slate-50 p-2">{JSON.stringify(l, null, 2)}</pre>)}
          </div>
        </Card>
      )}
    </div>
  );
}
