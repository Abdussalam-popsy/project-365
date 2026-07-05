# Luminocare — Admin Prototype

Interactive mock of the admin ops app. UI + mock data only — no backend.

**Docs:** [`HANDOFF.md`](./HANDOFF.md) · [`pilot-plan.md`](./pilot-plan.md) · [`context.md`](./context.md)

## Run

```bash
npm install
npm run dev
```

## What's included

| Route | Screen |
|---|---|
| `/` | Dashboard — attention items |
| `/onboarding` | Pipeline board + candidate detail + shadow briefing |
| `/schedule` | Week view + cover matching panel |
| `/people/carers` | Carers table |
| `/people/clients` | Clients table |
| Sidebar | AI Copilot drawer (mock responses) |

## Architecture

```
src/data/types.ts          ← export to platform (API contract)
src/data/mock-agency.ts    ← do not export (replace with API)
src/lib/cover-match.ts     ← export (rules engine → AI later)
src/components/**          ← export feature folders to platform
src/pages/**               ← rewrite in platform (wire to API)
```

Components take **props** — pages pass mock data. See `HANDOFF.md` for export workflow.

## Demo flow

1. **Onboarding** — click Jordan Blake in Shadow column → Copy briefing
2. **Schedule** — click Find cover on Wed 14:00 Mrs Chen → pick Mike Thompson → Copy message
3. **AI Copilot** — try "Who's missing DBS?" or "Show today's gaps"
