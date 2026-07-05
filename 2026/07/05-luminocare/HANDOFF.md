# Luminocare — Platform Handoff Context

**Purpose:** Everything agreed in planning so the main platform repo (built from scratch) can start with full context. Read this before writing a line of production code.

**Related docs in this folder:**
- [`context.md`](./context.md) — pain points, entity model, original 8-week vision
- [`pilot-plan.md`](./pilot-plan.md) — team brief, Week 1 sprint, rollout by bits

**This folder (`05-luminocare`)** is a **UI prototype only**. It lives in `project-365` (design interactions repo). The platform is a separate external repo.

---

## What We're Building

**Luminocare** is an operations layer for UK domiciliary care agencies — not a full rostering replacement on day one.

Today, agency ops are split across:
- The rostering tool (individual calls, no "runs")
- A Word doc ("doubles list")
- A photo board on the wall
- WhatsApp/SMS as the actual system of record
- Staff memory (drivers, reliability, visa hour caps, regional knowledge)

We become the source of truth **one workflow at a time**, ground-up. We are **not** plug-and-play with existing tools (CM2000, Sage, legacy roster systems).

### Target entity model

```
Agency
 ├─ Carers (driver/non-driver, employment type, hours cap, tenure, region)
 ├─ Patients/Clients (address, package, alerts, medical contacts)
 ├─ Runs (ordered sequence of calls, driver + non-driver pairing)
 ├─ Calls (single visit: time window, duration, allocation)
 ├─ Shifts / Cover Requests (cancellation, candidates, confirmation)
 ├─ Onboarding Pipeline (candidate → screened → DBS → training → shadow → live)
 └─ Status Events (hospitalization, discharge, reassignment)
```

Most pain comes from these entities living in three disconnected places (rota system, Word doc, staff memory). Platform schema should target this model; ship slices incrementally.

---

## MVP Scope (What to Ship First)

### In scope for pilot

| Feature | Replaces |
|---|---|
| **Onboarding pipeline** | Paper forms, ad hoc phone screens, WhatsApp shadow briefings |
| **Cover matching** | Alphabetical carer scan, manual conflict checking, one-by-one texting |
| **Ops dashboard** | Pipeline status, open cover requests, AI suggestions in one place |
| **People (carers + clients)** | Manual directory — data foundation, no integration |

### Out of scope until validated

- Travel / distance calculation
- Run-as-object bulk reassignment
- Full drag-and-drop rota builder
- Hospitalization tracking
- Payroll / Sage integration
- Carer self-serve app
- Autonomous messaging to carers
- Multi-agency self-serve signup

### The 8-week plan in `context.md`

**Vision and backlog only — not an execution schedule.** Build one week at a time based on pilot and sales feedback. Do not commit to weeks 3–8 upfront.

---

## Week 1 Goal (Pilot + Outreach)

**By end of Week 1:**
1. One real pilot agency using the product (onboarding with real candidates)
2. One demo you can send to prospects (Loom + demo link)

### Two tracks

| Track | Purpose | Data |
|---|---|---|
| **Pilot** | Real agency, real feedback | Their data — no synthetic |
| **Outreach** | Loom, intros, "book a pilot" | Demo tenant — synthetic OK |

### What ships

**Must have:**
- Login + pilot agency account (platform repo)
- Onboarding: add candidate → stage board → doc checklist → shadow briefing copy
- Carer list + client list (manual add, ~20 carers + ~5 clients for kickoff)
- Demo tenant with pre-loaded synthetic data for sales

**Stretch:**
- Schedule week view (read-only) + cover panel with rules-based ranking (demo)
- AI copilot drawer (mock responses)
- CSV import for carers

**Cut:**
- Full scheduling / rota replacement
- Real AI agent (forms + rules engine are fine for week 1)
- Everything else in the long-term roadmap

### Pilot vs outreach split

| | Onboarding | Cover matching |
|---|---|---|
| **Live pilot by end of week 1?** | Yes — no rota data needed | No — needs calls in system |
| **Sales "wow"?** | Moderate | High |
| **Week 1 priority** | **Build for real** | **Demo screen only (stretch)** |

### Honest pitch for outreach

> "We're piloting with [Agency X]. Luminocare tracks carer onboarding in one place — pipeline stages, missing docs, shadow shift briefings — instead of paper forms and WhatsApp screenshots. Cover matching is next. Free 4-week pilot, 30-minute setup."

Do **not** promise: replacing their roster system, plug-and-play integration, full AI autonomy, the 8-week roadmap.

---

## Admin App — Information Architecture

One admin app. Three work areas. AI attaches to actions — not a standalone chat product.

```
┌─────────────────────────────────────────────────────────────────┐
│  Luminocare          [Agency ▾]                   [AI Copilot ◧] │
├──────────┬──────────────────────────────────────────────────────┤
│ Dashboard│  Summary: pipeline counts, today's gaps, open cover   │
│ Onboard  │  Pipeline board → candidate detail → shadow briefing │
│ Schedule │  Week view → call detail → cover panel               │
│ People   │  Carers table + Clients table                        │
└──────────┴──────────────────────────────────────────────────────┘
```

### Routes (platform)

```
/                  → Dashboard
/onboarding        → Pipeline board (Kanban)
/onboarding/:id    → Candidate detail
/schedule          → Week view (Mon–Sun calls)
/people/carers     → Carers table
/people/clients    → Clients table
```

### Onboarding screens

**Pipeline board** — columns: `Applied → Screened → DBS → Training → Shadow → Live`

Each card: name, area, driver y/n, days in stage, missing doc badge.

**Candidate detail:**
- Intake: area, driving, experience, availability
- Doc checklist: DBS, ID, training cert (missing = badge)
- Stage history: who moved, when
- Shadow briefing: client, address, pairing carer → **Copy briefing**
- Later: "Intake with AI" → conversational form fills fields

**Pipeline stages (enum):**
`applied | screened | dbs_submitted | training_booked | shadow | live`

### Scheduling screens (demo-first in prototype; real in week 2+)

**Not a full rota builder.** Read + act on problems:

- Week list/calendar: calls with status (covered / gap / cancelled)
- Click call → detail drawer
- Cancelled or gap → **Find cover** → cover panel

**Cover panel:**
- Input: cancelled call (client, time, driver required?)
- Output: ranked carers (region, driver, conflict, hours cap)
- Draft WhatsApp message → Copy / Mark as sent
- Week 1: rules-based ranking; swap for AI API later — **same UI**

### People screens

**Carers:** name, phone, region, driver, employment type (permanent/student/sponsored), weekly hours cap

**Clients:** name, address, region, package, medication-sensitive flag

### Dashboard (thin for v1)

Three stat cards linking to real screens:
- In onboarding (+ missing DBS count)
- Gaps today
- Open cover requests

---

## UI + AI — How They Stack

Build UI first with mock/rules logic. AI plugs in without UI rewrites.

```
Layer 3  │  AI (chat, ranking, drafts)     ← buttons on existing screens
Layer 2  │  Workflows (onboarding, cover)  ← prototype NOW with mock data
Layer 1  │  Shell + People + types         ← start here
```

### AI modes (not just a chatbot)

| Mode | Example | Pilot? |
|---|---|---|
| **Assistive chat** | "Who's DBS pending?" | Week 2+ |
| **Workflow copilot** | Cancel shift → rank carers → draft message | Demo week 1, real week 2 |
| **Proactive flags** | Missing docs, cover overdue | Rules first, AI later |

### AI trigger map

| UI surface | Trigger | AI does |
|---|---|---|
| Add candidate | "Intake with AI" | Conversational form → fields |
| Candidate detail | Auto | Flag missing docs |
| Schedule → gap | "Find cover" | Rank + draft message |
| Global | Copilot drawer / ⌘K | Answer questions from agency data |
| Dashboard | Passive | Badges for attention items |

**Human stays in the loop for:** sending messages, final assignment, going live on rota, judgment on medication-sensitive clients.

**Do not:** message carers autonomously, reassign shifts silently, replace roster system in MVP.

---

## Prototype vs Platform — Two Repos

| | `project-365/05-luminocare` | External platform repo |
|---|---|---|
| **Purpose** | UI exploration, Loom, design review | Real pilot, team build, deploy |
| **Contains** | Components, types, mock data, shadcn | Auth, DB, API, multi-tenant, CI/CD |
| **Lifespan** | Weeks per feature slice | Production |
| **Share with team** | Demo link + "this is how it should look" | Where everyone commits code |

### Prototype build order

| Priority | Screen | Pilot | Demo |
|---|---|---|---|
| 1 | App shell + nav + mock data | ✓ | ✓ |
| 2 | Onboarding pipeline board | ✓ | ✓ |
| 3 | Candidate detail + briefing | ✓ | ✓ |
| 4 | People tables | ✓ | ✓ |
| 5 | Schedule week view | — | ✓ |
| 6 | Cover panel (mock rank) | — | ✓ |
| 7 | AI copilot drawer (mock) | — | stretch |
| 8 | Dashboard | nice | nice |

### Prototype file structure (target)

```
05-luminocare/src/
├── components/
│   ├── ui/                    ← shadcn (copy to platform too)
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   └── copilot-drawer.tsx
│   ├── onboarding/
│   │   ├── pipeline-board.tsx
│   │   ├── candidate-card.tsx
│   │   └── candidate-detail.tsx
│   ├── scheduling/
│   │   ├── week-view.tsx
│   │   ├── call-row.tsx
│   │   └── cover-panel.tsx
│   └── people/
│       ├── carers-table.tsx
│       └── clients-table.tsx
├── data/
│   ├── types.ts               ← EXPORT: contract for API
│   └── mock-agency.ts         ← DO NOT export; platform uses API
├── lib/
│   └── cover-match.ts         ← EXPORT: pure logic; may move server-side
└── App.tsx                    ← DO NOT export; rewrite in platform
```

### Prototype rules (makes export painless)

1. **Components take props** — never import `mock-agency.ts` inside a component
2. **Pages/wrappers** fetch mock data and pass down
3. **types.ts** matches what the platform API will return
4. **No auth, no DB, no API** in the prototype
5. **Freeze a slice** when exporting — stop editing it in the prototype

**Good pattern:**

```tsx
// pipeline-board.tsx — portable
export function PipelineBoard({ candidates }: { candidates: Candidate[] }) { ... }

// Prototype page
<PipelineBoard candidates={mockAgency.candidates} />

// Platform page
<PipelineBoard candidates={candidates} />  // from loader / hook / API
```

---

## Export Workflow (Prototype → Platform)

There is no automated export. **Curated copy per feature slice**, one PR at a time in the platform repo.

### What to copy

| Copy | Notes |
|---|---|
| `components/onboarding/*` | Tweak `@/` imports |
| `components/scheduling/*` | When stable |
| `components/layout/*` | Shell may need auth wrapper in platform |
| `components/ui/*` | shadcn — or re-add via CLI in platform |
| `data/types.ts` | → `lib/types/` or shared package |
| `lib/cover-match.ts` | Pure logic; may become server action |
| Theme / CSS variables | Tailwind tokens |

### What to rewrite in platform

| Rewrite | Why |
|---|---|
| `App.tsx`, routing | Auth guards, loaders, tenant context |
| All pages | Wire to API / DB |
| `mock-agency.ts` | Replace with Postgres + seed script |
| Auth, middleware, env | Platform-only |
| DB schema + migrations | Platform owns truth |

### Export steps (each slice)

1. **Freeze** the slice in prototype (stop editing those files)
2. **Copy** component folders into platform repo
3. **Fix** imports; add missing shadcn components (`npx shadcn@latest add ...`)
4. **Wire** pages to API — same component props, different data source
5. **PR** in platform: `feat(ui): import onboarding from prototype`
6. **Attach** Loom or screenshot if behavior is non-obvious
7. **Deploy** staging → pilot tenant

### Export checklist

Before copy:
- [ ] Components use props only (no mock imports inside)
- [ ] `types.ts` reflects intended API shape
- [ ] List of shadcn components used
- [ ] No hardcoded "Demo Agency" in components (use props or context)

After copy:
- [ ] Imports resolve, build passes
- [ ] Page fetches from API or seed data
- [ ] Visual match with prototype
- [ ] Feature frozen in prototype

### Ongoing rhythm

- **New feature:** explore in prototype → export folder when stable → freeze in prototype
- **Small fix:** cherry-pick single file into platform
- **Do not:** re-export entire app; keep two repos in sync forever

### When to level up (later)

| Stage | Workflow |
|---|---|
| Now (1–2 devs) | Copy folders + PR |
| 3+ devs | Consider `packages/ui` monorepo or Storybook |
| Mature | Internal component library |

Copy-paste is correct for now. Don't over-engineer.

---

## Platform Repo — Suggested Starting Point

When creating the external repo from scratch:

### Day 1 foundation

- [ ] Multi-tenant auth (agency = tenant, 1–3 staff users per pilot)
- [ ] Postgres schema: `agencies`, `users`, `carers`, `clients`, `candidates`, `calls`, `cover_requests`
- [ ] Deployed environment (pilot URL, HTTPS)
- [ ] Import `types.ts` from prototype as schema guide

### Week 1 platform priorities

1. Auth + tenant isolation
2. CRUD: carers, clients, candidates
3. Onboarding stage transitions + audit (who, when)
4. Shadow briefing endpoint or server action (generate text from candidate + client + pairing carer)
5. Seed script for demo tenant (synthetic) + empty pilot tenant
6. Import onboarding UI from prototype

### Data bootstrap (no integrations)

Pilot agency provides manually — do not wait for exports from legacy systems:

| Entity | Week 1 need | How |
|---|---|---|
| Carers | ~20 for shadow pairing | Manual or CSV |
| Clients | ~5 for briefings | Manual |
| Candidates | Created in-app | Native workflow |
| Calls / rota | Week 2 for cover | Not needed for onboarding pilot |

**Kickoff rule:** 20 carers + 5 clients on a spreadsheet, 30-min setup call.

### Demo tenant vs pilot tenant

| | Demo tenant | Pilot tenant |
|---|---|---|
| **Data** | Synthetic, pre-seeded | Real, entered by agency |
| **Use** | Sales Loom, cold outreach | Actual workflow |
| **URL** | Can be same app, different login | Production pilot |

---

## AI Implementation Notes (Platform)

Layer AI after UI works with rules/mock:

| Week | AI | Sits on |
|---|---|---|
| 1 | None (forms + rules) | Working onboarding |
| 2 | Conversational intake + doc flags | Onboarding |
| 2–3 | Cover ranking + message drafts | Cover flow |
| 3+ | Ops chat | Enough agency data |
| 5+ | Retention flags | Hours history |

Cover ranking v0 (rules, no LLM):
- Region match
- Driver requirement
- Schedule conflict check
- Weekly hours cap (student 20hr rule)
- Optional: past pairing with client

Message draft template (match agency tone):
> "Hi {name}, hope you're well — can you cover {client} today at {time} in {area}? Let me know, thanks!"

Swap rules for LLM API call later — same UI, same props.

---

## Key Pain Points → MVP Mapping

| Pain (from walkthrough) | MVP? |
|---|---|
| Alphabetical cover scan + one-by-one texting | Yes — cover panel |
| Paper onboarding + WhatsApp shadow briefings | Yes — onboarding |
| No pipeline stage tracking | Yes — pipeline board |
| WhatsApp as system of record | Partial — audit trail on cover/onboarding |
| Manual Google Maps travel checks | No — later |
| "Runs" not a system concept | Partial — visibility only |
| Hospitalization blind spot | No — later |
| Payroll / Sage | No — later |
| Retention in staff intuition only | Partial — flags later |

---

## Open Questions (Resolve with Team)

1. **Scheduling definition:** For pilot, fill gaps + assign new carers — or replace weekly rota building?
2. **GDPR timeline:** When can pilot agency provide consented real data at scale?
3. **Pilot champion:** Who at the agency owns day-to-day feedback?
4. **Data bootstrap:** Can they provide 20 carers + 5 clients via spreadsheet at kickoff?
5. **Platform stack:** Next.js? Vite + separate API? Decide before day 1 — prototype is Vite + React + TS + Tailwind + shadcn.

---

## Summary for Platform Devs

1. **Read** `context.md` for domain pain; **read** `pilot-plan.md` for team brief.
2. **This prototype** is the UI spec — export components, not the whole app.
3. **Ship onboarding first** — real pilot; cover matching is week 2 + demo stretch.
4. **Ground-up** — no legacy integrations; manual data entry at kickoff.
5. **AI is Layer 3** — UI + rules first; LLM plugs into existing buttons.
6. **8-week plan is backlog** — execute one week at a time from pilot feedback.
7. **types.ts is the contract** between prototype, API, and DB.

---

*Last updated: July 2026 — from planning sessions covering MVP scope, Week 1 sprint, admin IA, prototype/platform split, and export workflow.*
