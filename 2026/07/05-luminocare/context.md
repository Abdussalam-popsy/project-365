# Luminocare — Pilot Agency Walkthrough Analysis & 8-Week Build Plan

Source: pilot agency screen-share walkthrough (rostering system + doubles list + CM2000 clock-in) + team notes.

---

## 1. Pain Point Map

### A. Scheduling & Rostering

- **No travel/distance calculation.** Admin manually checks Google Maps to figure out if a carer can reasonably get from one client to the next. No factoring of transport mode (driver vs. public transport vs. walking). Described as taking "quite a while" every time a new client or carer is added.
- **"Runs" aren't a system concept.** The rota only understands individual calls. A run (driver + non-driver doing a sequence of calls together) is a manual construct the staff hold in their heads and in a separate Word doc ("doubles list"). Reassigning a carer off a run means editing every single call one at a time — no bulk reassignment.
- **Rigid date handling bug.** The system only generates correct rotas Monday–Sunday; any other date range shifts all the dates silently wrong. Pure software defect, but it forces a fixed weekly rhythm on the whole operation.
- **System lag** since a recent update — no root cause given, just tolerated.
- **Splitting runs to cover gaps penalizes the non-driver** who was double-booked (they lose hours), so staff avoid it — meaning coverage gaps get _harder_ to solve as they compound, not easier.

### B. Cover & Cancellation

- **Zero self-serve marketplace.** A carer who wants to cancel calls the office. Admin then manually scans an alphabetically sorted carer list, cross-checking who's a driver, who's already booked, who lives in the right area, before texting each candidate one-by-one and waiting for a yes/no.
- **The "matching" tool is a literal photo board on the wall** grouped by region — a physical, non-digital index that only works because tenured staff have memorized it.
- **Late cancellations (called in ~25 min before shift start)** leave almost no time to resolve, and time-sensitive clients (medication schedules) can't absorb a late or early carer.
- **No formal accept/confirm trail** — confirmation happens over text/WhatsApp, with admin manually double-checking the rota isn't double-booked before finalizing.

### C. Client Continuity / Hospitalization

- **Total blind spot when a patient goes to hospital.** The agency is _never proactively notified_ — they find out because a carer arrives and no one answers, or because they call the hospital switchboard to chase.
- **Silent client loss.** If the agency doesn't chase a hospitalized patient, the hospital or council may reassign the case to a different agency without telling the original agency _or_ the family. The client goes home expecting their regular carers and a stranger agency shows up instead.
- **No data handoff between agencies.** Every reassignment starts from zero — no shared care history, preferences, or continuity notes. Framed in the notes as a GDPR/interoperability gap (ESR/MDS, NHS discharge summaries not integrated).
- **Getting patient status is manual and inconsistent** — sometimes hospital staff will confirm a death over the phone with just a DOB, sometimes they won't say anything without being on the ward directly.

### D. Welfare & Deterioration Monitoring

- **No proactive risk detection.** The only signal that something is wrong is a carer physically not getting an answer at the door. Carers have walked in on clients who had already been dead for hours.
- **Carers get informally investigated** ("did you contribute to this death?") with no documented audit trail to protect them — this is a liability and retention risk in itself.
- **Alerting is minimal**: time-based lateness thresholds only, nothing behavioral (e.g., pattern of refused entry, missed logs, family contact frequency).

### E. Onboarding

- **Fully manual, ad hoc phone screen** — no structured intake, no system record of the funnel stage a candidate is in.
- **Paper application forms**, DBS paid for and coordinated manually, shadow shifts assigned by sending a WhatsApp screenshot of an address and phone number.
- **No seniority/reliability data model.** The system has no field distinguishing a brand-new carer from a 9-year veteran — that knowledge lives entirely in staff memory.
- **No structured onboarding pipeline status** (screened → DBS submitted → training booked → shadow shifts complete → live on rota).

### F. Payroll & Invoicing

- **Two disconnected systems** — the rostering system and Sage — with fully manual re-entry between them.
- **Timesheets are emailed individually to all 180 carers, printed, and then manually re-sorted alphabetically by hand** because replies don't arrive in order. Described as taking up to 3 days a month.
- **Planned vs. actual hours reconciliation is manual** (carers are paid their scheduled hours regardless of logged time, per policy, but the comparison itself isn't automated).

### G. Retention

- **Attrition signal exists only as staff intuition** ("you can tell in the first couple months if someone's going to be flaky") — not captured or tracked systematically.
- **Structurally different worker segments aren't modeled**: visa-sponsored workers (contractually need 40 hrs/week for 5 years), international students (capped at 20 hrs/week in term time, unlimited in holidays), and everyone else. Scheduling doesn't formally account for these constraints — it's tribal knowledge.
- **No reciprocity tracking** — informally, staff try to "make it up" to a non-driver who lost hours by prioritizing them for the next cover opportunity, but this isn't systematized, so it's inconsistent and easy to drop.

### H. Council / NHS Interop

- **Opaque handoff pipeline**: NHS discharges → council → council allocates/bids out to agencies, with no visibility for the previous agency into where a client landed.
- **Budget-driven service degradation**: council is converting double-up (2-carer) packages into single-carer packages and shrinking call windows (30 min → 15 min), which is _actively increasing_ the gaps agencies have to route around.
- **Social workers ping agencies ad hoc** ("do you have capacity for a 4x/day double package?") and staff answer from memory or the printed doubles list rather than a queryable capacity view.

### I. Communication & Audit Trail

- **WhatsApp/SMS/phone calls are the actual system of record** for cancellations, cover requests, and confirmations — none of it is captured in the platform itself.
- **Clock-in integrity is compromised.** The NFC tag system (staple tag to a folder in the client's home) is routinely defeated — carers unstaple tags and carry them between houses, or pass them to each other, to save a few minutes.

---

## 2. Refined Entity Model

```
Agency
 ├─ Carers (driver/non-driver, employment type, hours cap, tenure, region)
 ├─ Patients/Clients (address, package hours/week, alerts, medical contacts, keysafe)
 ├─ Runs (ordered sequence of Calls, driver+non-driver pairing, region)
 ├─ Calls (single visit: time window, duration, single/double, permanent allocation)
 ├─ Shifts/Cover Requests (cancellation, candidate matches, confirmation state)
 ├─ Onboarding Pipeline (candidate → screened → DBS → training → shadow → live)
 ├─ Hospitalization/Status Events (admitted, discharged, reassigned, deceased)
 ├─ Payroll Records (planned hrs, actual hrs, reconciliation, export to Sage)
 └─ Council/NHS Interface (referral, package terms, reassignment events)
```

This is the backbone Luminocare's data model should target — most current pain comes from these entities living in three disconnected places (the rota system, a Word doc, and staff memory).

---

## 3. 8-Week Build Plan

| Week  | Focus                                                                                | Outcome                                                                                 |
| ----- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **1** | AI Ops Agent v0 — onboarding assistant + cover-matching copilot + retention flagging | Working agent on synthetic data, demoable to pilot agency                               |
| 2     | Smart cover-matching engine + self-serve shift board                                 | Carers can claim open shifts; auto-ranked candidate suggestions replace manual scanning |
| 3     | Run-as-object scheduling + travel/time engine                                        | Bulk reassignment of runs; real distance/time calc by transport mode                    |
| 4     | Hospitalization & continuity tracking                                                | Auto-flag missing patients, follow-up timers, family status visibility                  |
| 5     | Deterioration/preventive AI + audit trail                                            | Pattern-based welfare flags, documented escalation trail for carer protection           |
| 6     | Payroll/timesheet automation                                                         | Auto-generated, pre-sorted timesheets; structured export toward Sage-style systems      |
| 7     | Retention analytics dashboard                                                        | Attrition risk scoring, segment-aware scheduling (sponsored/student/permanent)          |
| 8     | Pilot integration, compliance pass, demo                                             | GDPR/CQC review, live pilot handoff, feedback loop defined                              |

---

## 4. Week 1 Detail — AI Operations Agent v0

**Scope call:** the ask ("onboarding to scheduling to retention, in one week") is the _full product vision_, not a buildable week-1 slice. Week 1 should ship a single agent with three narrow, real skills rather than three shallow ones — proving the interaction model works before widening scope.

### Goal

One conversational AI agent (usable by office staff, not carers yet) that can:

1. Walk a new carer candidate through onboarding intake and track pipeline status.
2. Given a cancelled shift, surface ranked cover candidates instantly instead of manual scanning.
3. Surface a retention risk flag for any carer working under 20 hrs/week whose pattern suggests disengagement.

### Data foundation (Day 1)

- Since real client/carer data can't be used pre-agreement (GDPR), build the **synthetic data engine** first: ~50 synthetic carers (mix of driver/non-driver, sponsored/student/permanent, regions), ~50 synthetic patients (packages, regions, double/single call needs), 1 week of synthetic rota data mirroring the real structure (runs, calls, gaps).
- Define the entity schema above in a lightweight DB (Postgres or SQLite for the pilot).

### Skill 1 — Onboarding Assistant (Day 2)

- Conversational intake flow replacing the paper form: area, driving status, experience, availability.
- Tracks pipeline stage automatically: `screened → DBS submitted → training booked → shadow shifts (2 or 3, based on experience) → live`.
- Auto-generates the shadow shift briefing (client name, address, pairing carer's contact) that's currently done by hand-cropped WhatsApp screenshots.
- Flags missing documents (DBS, ID) instead of relying on staff memory.

### Skill 2 — Cover-Matching Copilot (Day 3–4)

- Input: a cancelled call/run.
- Agent ranks candidate carers by: region match, driver requirement, no schedule conflict, hours remaining under their weekly cap (student 20hr rule respected automatically), and past pairing history with that client/run.
- Outputs a ready-to-send message draft (mirrors the actual "Hi, hope you're well, can you please work with Brenda today in Arnold" pattern staff already use) rather than a bare list — keeps the human-in-the-loop confirmation step, since accountability there matters.
- This directly replaces the alphabetical-scan-and-text workflow shown in the walkthrough.

### Skill 3 — Retention Risk Flag (Day 5)

- For carers under 20 hrs/week specifically: track decline frequency, hours trend over trailing 4 weeks, tenure, and whether they proactively arrange their own cover (a strong positive signal per the walkthrough — "the good ones text and say I've already sorted my shift").
- Surface a simple risk tier (stable / watch / at-risk) to staff — not to replace judgment, but to catch the pattern earlier than "you can just tell after a couple months."
- Explicitly does **not** auto-message carers this week — flagging only, human decides the intervention. Automated retention nudges are a Week 7 concern once the segmentation model is validated.

### Explicitly out of scope for Week 1

- Travel/time-distance calculation (Week 3)
- Hospitalization tracking (Week 4)
- Payroll automation (Week 6)
- Any live integration with the pilot agency's real system or real client data

### Deliverable at end of Week 1

A demoable agent (chat interface is fine) running against synthetic data that can be shown to the pilot agency: "here's how onboarding, cover-finding, and retention flagging change with this in place." That demo is what earns access to real (anonymized/consented) data for Week 2 onward.
