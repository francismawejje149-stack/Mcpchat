# Vacker Advertising Assistant (Next.js 14)

This app is now configured to act as a chatbot assistant for **Vacker Advertising (Uganda)** using a local JSON knowledge source instead of a database-backed company dataset.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn-style components
- OpenAI npm SDK
- Zod validation
- Local JSON knowledge base (`data/vacker-company.json`)

## Run locally
```bash
npm install
npm run dev
```

Open:
- Chat UI: `http://localhost:3000/`

## Environment variables
Create `.env.local` with:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
# Optional
OPENAI_BASE_URL=https://api.openai.com/v1
```

## JSON knowledge mode
- Chat endpoint (`app/api/chat/route.ts`) runs without DB-backed sessions.
- Assistant knowledge comes from `data/vacker-company.json`.
- Internal tool `internal.vacker_profile` serves:
  - overview
  - contact details
  - services
  - social media links
  - notable clients

## Data source notes
The Vacker profile JSON was populated from publicly available sources:
- https://vacker.co.ug/
- https://vacker.co.ug/contact-us/
- https://vacker.co.ug/portfolio/super-structure-kabalagala/
- https://ug.linkedin.com/company/vacker-company-limited

## Important
Some admin/database APIs are still present in the codebase from the original scaffold. The chat assistant path has been switched to JSON-backed operation for company data and sessions.
