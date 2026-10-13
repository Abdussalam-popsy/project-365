---
name: haven-site
description: >
  Project playbook for the Haven marketing site (this folder): the brand palette and type, the homepage
  story and section order, the WO-9002 example used across sections, the hero's history and why the
  day/night diorama won, the dev tools (glow editor, hero picker, tuner), how it deploys, and the open list of
  things the client must confirm. Use for any work on the Haven site: new sections, copy, client feedback
  rounds, polish, or the move to the client's domain. Pairs with the generic web-design plugin skills.
---

# Haven site playbook

Haven makes AI agents (Maintenance, Leasing, Receptionist) for property managers. This site is a Next.js
static export with Tailwind v4 and Motion. Copy lives in `src/content/`, components in `src/components/`, and
the brand tokens in `src/app/globals.css`. `lessons.md` explains the code file by file.

Use the generic `web-design` plugin skills for process. This file holds what is specific to Haven.

## Brand

- **Type:** Geist, light weight (300) for headings. Section headings are 40/52px via `SectionIntro` in
  `src/components/SectionHeading.tsx`; the closing CTA is larger (44/68).
- **Palette (one job per colour):**
  - `night` #0e0b10: every dark section background
  - `page` #f6f3f8: every light section background
  - `ink` #1e0f26: text on light backgrounds
  - `plum-800` #43234f: glows on dark sections
  - `lilac` #c9b5da: highlighted words on dark
  - `orchid` #9a77b3: highlighted words on light
  - `heather` #5c3a70: labels, eyebrows and the primary button on light
  - `tray` #ede8f1 behind mocks, `bubble` #e6e0e9 for residents' chat bubbles
- **Buttons:** white on dark, heather on light, 10px radius. "Book a demo" is `mailto:hello@usehaven.ai` (not Calendly).
- **Mocks:** a rounded tray, white cards with one soft shadow, status chips, chat bubbles. Pieces live in
  `src/components/agent-page/ui.tsx`. On phones mocks shrink with the `mock-compact` utility (80%).
- **Headings never leave an orphan word:** text-wrap rules sit in `@layer base` in `globals.css`. Don't
  move them out; outside the layer they break `truncate` in production builds.

## Homepage story (in order)

Hero (day/night diorama) → logo marquee → logo zoom → problem statement (pinned) → Agents → Channels
("Inside the tools your team already uses", `#platform`) → Voice demo → Firm context ("It knows your
firm. Down to the unit.") → Decisions ("Every decision, explained.") → Outcomes (Team vs Haven calendar) →
Customers (`#customers`, provisional) → Testimonials → closing CTA.

Removed on purpose: "Why Haven", "How it works", and the firm-context 3×2 feature grid (copy parked in
`src/content/firmContext.ts` as `firmFeatures`, with restore instructions).

## The example used across sections

One maintenance case runs through Channels, Firm context and Decisions. Keep its details identical:

- **WO-9002**, no heat, **220 Gay Street, unit B**, resident **Chris Nolan**
- Texted at **7:42pm on Sep 12**. **Knox HVAC** is first for HVAC (then Volunteer Air); dispatched at 7:44pm, accepted at 7:51pm
- Rules: no heat under 55°F is an emergency (Firm); owner approval above $300 (Firm), replaced by **$500**
  (Rocky Top portfolio); keys at the office after 5pm (property); Chris prefers text, and there's a dog in the unit (unit)
- Owner approves the **$840** estimate by email on Sep 13; repair confirmed by phone on Sep 14 at 11:02am; closed in AppFolio

The Maintenance agent page tells the same story.

## Hero history (why the simple one won)

v1 signal-field canvas (about 11fps on a laptop) → v2 Three.js skyline → v3 pixel split grid and v3-alt
centred grid → v4 residential skyline → v5 3D neighbourhood, dark and light, with camera tuning →
**v6: a still diorama image with a day/night switch** and rotating headline words (night: "Haven answers
your 2am emergencies"; day: "Haven keeps your work orders moving"). v6 is the default; every other version
stays in Archive and is reachable with `?hero=<id>`. Dedicated portrait art for phones is still pending.

## Dev tools (hidden by default)

Press **§** or **`** (the user is on a UK keyboard), or add `?tools`, to show them:
- **Glow editor:** tunes the four dark-section glows (Closing CTA, Voice demo, Outcomes, Logo zoom). The
  user tunes, presses "Copy values" and pastes the JSON; apply it to `src/content/glows.ts`.
- **Hero picker and perf meter:** dev only, or with `?hero=`.
- **Tune panel:** dev only, or with `?tune`.
- **Agentation feedback toolbar:** dev only. Feedback arrives as "Page Feedback" blocks naming the
  component; act on the named component.

## Working with the client

- Feedback comes in batches through the designer (the user), often as screenshots, Looms or Agentation
  notes. Collect the whole batch, then sequence: global changes first, then section by section.
- The user prioritises **site-wide consistency**: apply every fix to every matching section.
- Before a merge, say that merging to `main` deploys the live site.

## Deploy

GitHub Actions builds every project in the monorepo and publishes to GitHub Pages at
`https://abdussalam-popsy.github.io/project-365/2026/10/08-haven-site/`. `NEXT_BASE_PATH` sets the
sub-path and `NEXT_PUBLIC_SITE_ORIGIN` sets the site address used for link previews. Don't run `next build`
while the dev server is running. After every merge, check the live site.

Planned: a Haven-only repo (ideally in the client's GitHub org), hosted on Vercel or Cloudflare Pages, then
a DNS cutover from Webflow (see the `web-domain-launch` skill).

## Client must confirm (keep this list current)

- The customers row: the real firm list, permission to name each firm, the agents each uses, and logos
  (HBR Rentals and Paradise Palm are placeholders). The user would prefer logos plus agents only, without the floating mocks.
- "200+ firms / 150,000 units" (currently left out)
- "Never used to train a model" (Decisions section)
- "Dana Price" (the owner name in the email mock, which is invented)
- Real US city names in the Outcomes calendar, now that its "sample day" footnote has been removed
- URLs for About, Blog, Careers, Privacy, Terms, LinkedIn and X (the footer shows them as plain text for now)
- The "Top 50 AI startups" article URL (the announcement bar hides "Read the article" until `announcement.href` is set)
