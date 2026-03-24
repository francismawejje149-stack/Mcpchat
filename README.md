# Company Assistant (Next.js 14 + Prisma + MCP)

Production-ready starter for a ChatGPT-style company assistant.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn-style components
- Prisma + SQLite
- Zustand + Framer Motion
- OpenAI npm SDK (dynamic baseURL/apiKey)
- Zod validation

## Run locally
```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Open:
- Chat UI: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin`

## Admin first run
1. Visit `/admin`.
2. Create admin password.
3. Configure company profile + provider settings.
4. Add collections and records.
5. Optionally add MCP servers and sync tools.

## MCP transport notes
- HTTP and SSE-style endpoints are supported through HTTP calls.
- Stdio/local command transport is modeled in schema and admin UI, but direct execution is intentionally blocked in route runtime by default for security/deployment portability.

## Architecture overview
- Dynamic tool registry merges:
  - Internal generated tools from enabled collections
  - Discovered MCP tools from enabled servers
- Agent loop in `lib/agent.ts` handles multi-step tool calling and approval checks.
- Approval requests persisted in DB and shown in chat UI.
- Structured card payloads rendered by components in `components/cards`.

## Security basics
- Admin password hashed with bcrypt.
- Session cookie + DB-backed admin sessions.
- Provider and MCP secrets remain server-side.
- Approval policy enforcement before mutating tools execute.

## Push to GitHub
If your repo is new, run:
```bash
git remote add origin https://github.com/francismawejje149-stack/Mcpchat.git
git push -u origin HEAD
```
