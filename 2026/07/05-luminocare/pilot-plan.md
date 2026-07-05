# Luminocare — Pilot MVP Plan & Team Brief

**Purpose:** Align the team on what we're building, the end-to-end flows, and how AI fits into operations — ahead of pilot launch.

**Date:** July 2026  
**Source:** Pilot agency walkthrough analysis (`context.md`)

---

## What We're Building

Luminocare is an **operations layer for UK domiciliary care agencies**. It does not replace the full rostering system on day one. It absorbs the work currently scattered across:

- The rostering tool (individual calls, no "runs")
- A Word doc ("doubles list")
- A photo board on the wall
- WhatsApp/SMS as the actual system of record
- Staff memory (drivers, reliability, visa hour caps, regional knowledge)

**Core problem:** Coordination at scale. ~180 carers, manual cover matching, ad hoc onboarding, no audit trail for decisions made over text.

**Target entity model:**

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

---

## MVP Scope (Pilot-Ready)

**In scope for pilot:**

| Feature | What it replaces |
|---|---|
| **Onboarding pipeline** | Paper forms, ad hoc phone screens, WhatsApp shadow briefings |
| **Cover matching** | Alphabetical carer scan, manual conflict checking, one-by-one texting |
| **Ops dashboard** | Pipeline status, open cover requests, AI suggestions in one place |

**Out of scope for pilot** (post-pilot roadmap):

- Travel / distance calculation
- Run-as-object bulk reassignment
- Hospitalization tracking
- Payroll / Sage integration
- Carer self-serve app
- Autonomous messaging to carers

---

## End-to-End Flows

### Flow 1: New Carer Onboarding

**Today**

1. Ad hoc phone screen — no structured intake
2. Paper application form
3. DBS paid for and coordinated manually
4. Shadow shifts assigned via WhatsApp screenshot of address + phone number
5. No system record of pipeline stage

**Pilot**

1. Structured intake (area, driving status, experience, availability)
2. Automatic pipeline tracking: `screened → DBS submitted → training booked → shadow shifts → live`
3. AI flags missing documents (DBS, ID)
4. Auto-generated shadow shift briefing (client, address, pairing carer contact)
5. Staff review and approve before sending

**Human stays in the loop for:** DBS payment, training booking, final "go live" decision.

---

### Flow 2: Shift Cancellation → Cover Found

**Today**

1. Carer calls office to cancel
2. Admin scans alphabetically sorted carer list
3. Manually checks: driver? booked? right area?
4. Texts candidates one-by-one via WhatsApp
5. Manually verifies rota isn't double-booked
6. No formal accept/confirm trail

**Pilot**

1. Admin logs cancellation in Luminocare
2. AI ranks candidates by: region, driver requirement, schedule conflict, weekly hours cap (student 20hr rule), past pairing history
3. AI drafts ready-to-send message (mirrors existing staff tone)
4. Admin picks candidate and sends
5. Confirmation captured with audit trail

**Human stays in the loop for:** Sending messages (initially), final assignment, judgment on sensitive clients (medication timing).

---

### Flow 3: Scheduling View (Lightweight)

For pilot, "scheduling" means **visibility + gap action**, not full rota rebuild:

- See the week's calls, runs, and gaps
- Act on gaps via cover flow above
- Track who's onboarded and ready to assign

Full run management (bulk reassignment, travel calc) comes after pilot feedback.

---

## AI in Operations — How It Works

### Three modes (not just a chatbot)

| Mode | What it does | Pilot? |
|---|---|---|
| **Assistive chat** | Staff ask; AI answers from agency data | Yes |
| **Workflow copilot** | Staff trigger action; AI does heavy lift | Yes — core MVP |
| **Proactive agent** | AI surfaces issues without being asked | Partial — flags only |

### What AI does vs. what humans do

| Task | AI | Human |
|---|---|---|
| Collect onboarding info | Structured intake | Approves stage transitions |
| Track pipeline stage | Automatic | Handles exceptions |
| Rank cover candidates | By region, driver, hours, conflict | Picks who to contact |
| Draft outreach messages | In staff's existing voice | Sends and confirms |
| Flag retention risk | Under-20hr pattern detection | Decides intervention |
| Assign to rota | — | Admin updates existing system |
| Message carers directly | — | Accountability and trust |
| Replace rostering system | — | Existing tool stays for now |

### One-line pitch

> **Luminocare is an AI ops copilot** — it does the scanning, ranking, drafting, and tracking that currently lives in staff heads and WhatsApp. Staff stay accountable; the system captures the decision trail.

**Not:** A chatbot carers talk to (yet).  
**Not:** A fully autonomous agent that reassigns shifts silently.  
**Is:** Agentic where it's safe; human-in-the-loop where accountability matters.

---

## Rollout Plan — Bit by Bit (Ground-Up)

We are **not** plug-and-play with existing rostering tools. Agencies keep their current system while Luminocare becomes the source of truth **one workflow at a time**. Each "bit" is a complete, usable slice — not a half-built platform.

```
Week 0   → Platform shell + Bit 1 (onboarding) ready to log in
Week 1   → Pilot access: agencies use onboarding with real candidates
Week 2   → Bit 2 (cover matching) goes live — requires minimal rota data entry
Week 3+  → Bit 3 (scheduling view), then AI enhancements, then carer-facing
```

### What pilot access means

| Week | Agency can… | Agency still does elsewhere |
|---|---|---|
| **1** | Track onboarding pipeline, generate shadow briefings | Full rota, payroll, clock-in |
| **2** | Log cancellations, get ranked cover + draft messages | Final rota updates (for now) |
| **3+** | See week view, manage calls in Luminocare | Phase out parallel entry |

---

## Week 1 Sprint — Pilot + Outreach (This Week)

**Forget the 8-week plan as an execution schedule.** Keep `context.md` as the vision and pain-point reference. Execute one week at a time based on what pilots and sales need *now*.

**Goal by Friday:** One real pilot agency using the product + one demo you can send to prospects.

---

### Two tracks, one week

| Track | Purpose | Can use synthetic data? |
|---|---|---|
| **Pilot** | Real agency, real candidates, real feedback | No — their data |
| **Outreach** | Loom, cold emails, intro calls, "book a pilot" | Yes — demo tenant |

You build **one workflow for real** (onboarding). You **show two stories in sales** (onboarding + cover matching teaser).

---

### Why onboarding for pilot, cover for demo

| | Onboarding | Cover matching |
|---|---|---|
| **Live pilot by Friday?** | Yes — no rota data needed | No — needs calls/shifts in system |
| **Sales "wow"?** | Moderate | High — "30 sec vs 30 min" |
| **Data to get started** | Zero (candidates created in-app) | Week of calls + carer list |

**Pilot = onboarding. Outreach demo = onboarding live + cover matching in demo mode.**

---

### What ships by Friday

#### Must have (pilot + outreach)

- [ ] Deployed URL with login (pilot agency account)
- [ ] Onboarding pipeline: add candidate → stage board → doc checklist → shadow briefing copy
- [ ] Carer list: manual add (10–20 enough for pilot)
- [ ] Client list: manual add (3–5 for shadow briefings)
- [ ] Demo tenant: pre-loaded synthetic agency for sales calls
- [ ] 90-sec Loom: "From WhatsApp screenshot to one-click briefing"
- [ ] 1-page outreach doc: problem → 30-sec demo link → "Free 4-week pilot"

#### Nice to have (stretch)

- [ ] CSV import for carers
- [ ] Cover matching **demo screen** (rules-based ranking on synthetic data — not production)
- [ ] AI conversational intake (forms are fine for pilot)

#### Explicitly cut

- Full scheduling / rota
- AI agent with 3 skills
- Retention flags
- Hospitalization, payroll, Sage, carer app
- Multi-agency self-serve signup
- Anything from weeks 3–8 of the old plan

---

### Day-by-day (single week)

| Day | Build | Outreach |
|---|---|---|
| **Mon** | Auth, deploy, schema, empty shell | Draft outreach list (10 agencies from network/referrals) |
| **Tue** | Onboarding form + pipeline stages | Record rough Loom on prototype (can re-record Thu) |
| **Wed** | Pipeline board + shadow briefing + carer/client CRUD | Send 5 warm intros: "Piloting next week, 15-min look?" |
| **Thu** | Pilot tenant live; demo tenant with synthetic data; cover demo screen (stretch) | Re-record Loom on live URL; send demo link |
| **Fri** | Pilot kickoff call — agency adds first real candidate on the call | Start outbound: Loom + "4-week free pilot" |

---

### Friday exit criteria

**Pilot is real if:**
- Agency staff logged in without your help
- ≥1 real candidate in the pipeline
- They said they'd add more next week

**Outreach is ready if:**
- Demo link works without you present
- You can explain in 60 seconds: *"We replace the WhatsApp-and-spreadsheet chaos for onboarding and cover — starting with onboarding this week."*
- You have a pilot offer: scope, duration, what you need from them (20 carers, 5 clients, 30 min kickoff)

---

### The pitch (honest, sellable)

Don't sell the 8-week vision. Sell this:

> **"We're piloting with [Agency X]. Luminocare tracks your carer onboarding in one place — pipeline stages, missing docs, shadow shift briefings — instead of paper forms and WhatsApp screenshots. Cover matching is next. 4-week free pilot, we set you up in 30 minutes."**

That's true by Friday if onboarding ships. Cover matching becomes the upsell / week 2 hook for agencies who say "what about cancellations?"

---

### After week 1 (backlog, not committed schedule)

| Priority | When | Trigger |
|---|---|---|
| Cover matching (real, not demo) | Week 2 | Pilot agency asks OR outreach prospects ask |
| AI ranking + message drafts | Week 2–3 | Cover flow working with rules first |
| Scheduling week view | When 2+ agencies have calls in system | |
| Everything else in `context.md` | When pilots validate the copilot model | |

The 8-week plan stays in `context.md` as **"where this goes"** — not **"what we build next Friday."**

---

**Goal:** Pilot agency can log in on Day 1 of Week 1 and onboard a real candidate. No synthetic demo required — the product IS the demo.

### What Week 0 is NOT

- Not a full rostering system
- Not AI agent v0 with three skills
- Not integration with their existing tools
- Not waiting for GDPR data export — agencies enter their own data

### What Week 0 IS

The minimum platform to support **one complete workflow** end-to-end.

---

### Week 0 — Day by Day

| Day | Build | Done when… |
|---|---|---|
| **1** | Platform shell | Agency account exists, staff can log in, data is tenant-isolated |
| **2** | Core schema + carer directory | Admin can add/edit carers (name, region, driver, hours cap, phone) |
| **3** | Bit 1: Onboarding pipeline | Admin can create candidate, move through stages, see pipeline board |
| **4** | Shadow briefing + polish | One-click briefing generated; UI exported from prototype |
| **5** | Deploy + pilot bootstrap | Pilot URL live, agency account provisioned, kickoff guide sent |

---

### Week 0 — Technical Checklist

**Platform (Day 1)**

- [ ] Multi-tenant auth (agency = tenant, 1–3 staff users for pilot)
- [ ] Postgres schema: `agencies`, `users`, `carers`, `candidates`, `onboarding_stages`
- [ ] Deployed environment (pilot URL, HTTPS)
- [ ] Basic ops layout: sidebar nav, empty dashboard shell

**Carer directory (Day 2)**

- [ ] Add / edit / list carers manually
- [ ] Fields: name, phone, region, driver (y/n), employment type, weekly hours cap
- [ ] CSV import template (optional but high leverage — agencies can paste from a spreadsheet)

**Bit 1 — Onboarding (Day 3–4)**

- [ ] Create candidate record (structured form: area, driving, experience, availability)
- [ ] Pipeline stages: `applied → screened → DBS submitted → training booked → shadow → live`
- [ ] Drag-or-click stage transitions with timestamp + who moved it
- [ ] Doc checklist (DBS, ID, training cert) — manual tick + "missing" badge
- [ ] Shadow briefing generator: client name, address, pairing carer contact → copy-to-clipboard
- [ ] Pipeline board view: columns by stage, count per stage

**Pilot bootstrap (Day 5)**

- [ ] Create pilot agency tenant + 2 staff accounts
- [ ] 30-min kickoff call scheduled: walk through adding first candidate
- [ ] Pilot guide (1 page): what to use Luminocare for this week, what stays in old system
- [ ] Feedback channel (Slack/WhatsApp/form)

---

### Week 0 — Data Bootstrap (No Integrations)

Since we can't pull from their roster system, agencies need a low-friction way to get data in:

| Entity | Week 0 need | How they get it in |
|---|---|---|
| **Carers** | Required for shadow pairing | Manual add or CSV import (~20 active carers to start, not all 180) |
| **Clients** | Required for shadow briefing | Manual add when scheduling first shadow (~5 clients) |
| **Calls / rota** | Not needed until Week 2 | — |
| **Candidates** | Created in Luminocare | Native — this IS the workflow |

**Kickoff rule:** Don't ask them to migrate everything. Ask for **20 carers + 5 clients** to run onboarding for real in Week 1.

---

### Week 0 — Prototype → Platform Handoff

```
project-365/05-luminocare     →  UI flows, interaction patterns, component designs
        ↓ export Day 3–4
full platform repo            →  auth, DB, API, deployed pilot environment
```

Prototype work in Week 0 should focus on **onboarding pipeline UI only** — not cover matching or dashboard charts. Export those screens; wire to real API.

---

## Week 1 — Pilot Access (Onboarding Live)

**Agency experience:** Log in → add candidates → track pipeline → generate shadow briefings.

| Day | Focus |
|---|---|
| 1 | Kickoff call — agency adds first 3 real candidates live on the call |
| 2–3 | AI intake assistant layered on (conversational form replaces static form) |
| 4 | Doc flag automation (AI nags on missing DBS/ID) |
| 5 | Check-in: how many candidates in pipeline? What's friction? |

**Success metric:** ≥3 real candidates tracked through at least one stage transition.

**Still manual:** DBS payment, training booking, updating the old rota when someone goes live.

---

## Week 2 — Bit 2 (Cover Matching Live)

**Prerequisite:** Agency enters this week's calls (manual or CSV). Doesn't need full history — just the current week.

| Day | Focus |
|---|---|
| 1 | Client + call entry UI (or CSV import for week of calls) |
| 2 | Cover request flow: log cancellation → see the gap |
| 3–4 | AI cover copilot: ranked candidates + draft WhatsApp message |
| 5 | Check-in: time-to-cover vs. their old workflow |

**Success metric:** ≥1 real cancellation resolved using Luminocare's ranked list.

---

## Week 3+ — Bit 3 and Beyond

| Bit | What ships | Depends on |
|---|---|---|
| **3 — Scheduling view** | Week calendar, gaps highlighted, click gap → cover flow | Calls in system |
| **4 — AI ops chat** | "Who's DBS pending?" / "Show at-risk carers" | Data volume |
| **5 — Retention flags** | Under-20hr pattern alerts | 4 weeks of hours data |
| **6 — Carer self-serve** | View/claim open shifts | Cover flow validated |

Each bit ships independently. An agency on Week 1 onboarding-only is a valid pilot — don't block them on scheduling.

---

## Revised AI Timeline

AI is layered **on top of working workflows**, not built in parallel on synthetic data.

| Week | AI feature | Sits on top of |
|---|---|---|
| 0 | None — structured forms work fine | Onboarding pipeline |
| 1 | Conversational intake + doc flags | Onboarding pipeline |
| 2 | Cover ranking + message drafts | Cover request flow |
| 3 | Ops chat (ask questions of agency data) | Carer + call data |
| 5+ | Retention risk flags | Hours history |

This avoids the trap of demoing an AI agent on fake data while the platform isn't usable yet.

---

## Team Meeting Agenda (60 min)

| Time | Topic |
|---|---|
| 10 min | Problem recap — "Three systems of record: rota, Word doc, WhatsApp" |
| 10 min | MVP scope — onboarding + cover matching only |
| 20 min | Walk through Flow 1 and Flow 2 — where human vs. AI |
| 10 min | AI model decision — copilot + flags, not autonomous messaging |
| 10 min | Week 0–2 plan — one bit at a time, onboarding first |

### Open questions to resolve

1. **Scheduling definition:** For pilot, does "scheduling" mean replacing weekly rota building, or improving how we **fill gaps and assign new carers**?
2. **GDPR timeline:** When can we access anonymized/consented real data?
3. **Pilot champion:** Who at the agency owns day-to-day feedback?
4. **Data bootstrap:** Can the agency provide 20 carers + 5 clients via spreadsheet for Week 1 kickoff?

---

## Week 0–2 Summary

| Week | Ship | Pilot agency does | Success metric |
|---|---|---|---|
| **0** | Login + carer directory + onboarding pipeline | Nothing yet — we prep their account | Pilot URL live, kickoff scheduled |
| **1** | Onboarding live (+ AI intake by end of week) | Track real candidates, generate shadow briefings | ≥3 candidates, ≥1 stage transition |
| **2** | Cover matching live | Enter this week's calls, resolve a cancellation | ≥1 cover found via ranked list |

---

## Key Pain Points We're Solving First

From the agency walkthrough — mapped to MVP:

| Pain | MVP addresses? |
|---|---|
| Manual Google Maps travel checks | No — Week 3 |
| "Runs" not a system concept | Partial — visibility only |
| Alphabetical cover scan + one-by-one texting | **Yes — core MVP** |
| Paper onboarding + WhatsApp shadow briefings | **Yes — core MVP** |
| No pipeline stage tracking | **Yes — core MVP** |
| WhatsApp as system of record (no audit trail) | **Yes — partial** |
| Hospitalization blind spot | No — Week 4 |
| Payroll / Sage manual re-entry | No — Week 6 |
| Retention signals in staff intuition only | Partial — flag only, no auto-nudge |

---

*Related: [`context.md`](./context.md) — full pain point map, entity model, and 8-week build plan.*
