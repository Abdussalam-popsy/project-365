# Lessons from the Haven site

A one-page marketing site in Next.js (App Router) + Tailwind v4 + Motion. The page is a stack of section components; copy lives in one data file; colours live in one CSS theme block.

```
layout.tsx (font + <html>/<body>)
└── page.tsx
    ├── AnnouncementBar   (fixed, top 40px)
    ├── Nav               (fixed under the bar, turns solid on scroll)
    └── <main>
        ├── Hero → HeroBackdrop
        ├── LogoMarquee
        ├── ProblemStatement → Word × N
        ├── Agents → Reveal + MaintenanceMock / LeasingMock / ComingSoonMock
        ├── VoiceDemo, Capabilities, Testimonials, Process, FinalCta
    └── Footer
```

<details>
<summary>@file: src/app/layout.tsx — explained</summary>

[Open the file](./src/app/layout.tsx).

### What this file is responsible for

Every page is rendered *inside* `RootLayout`'s `children`. It is the only place that writes `<html>` and `<body>`, so it is where the font and global CSS go.

### Read the code in small pieces

```tsx
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
```

`next/font/google` downloads Inter Tight at **build time** and self-hosts it (no request to Google from the visitor). `variable` makes Next create a CSS class that defines the custom property `--font-inter-tight`.

```tsx
<html lang="en" className={interTight.variable}>
```

`interTight.variable` is a generated class name string. Putting it on `<html>` means every element can read `var(--font-inter-tight)`.

In `globals.css`, `--font-sans: var(--font-inter-tight), ...` tells Tailwind that the `font-sans` utility uses it. So the chain is: next/font → CSS variable on `<html>` → Tailwind theme token → `font-sans` class on `<body>`.

`export const metadata` is read by Next and turned into `<title>` and `<meta name="description">`; you never render it yourself.

</details>

<details>
<summary>@file: src/app/globals.css — explained</summary>

[Open the file](./src/app/globals.css).

`@theme { --color-violet: #5740ef; }` is Tailwind v4 syntax. Any `--color-NAME` you declare becomes usable as `bg-NAME`, `text-NAME`, `border-NAME`. That is why components can write `bg-ink` or `text-lilac` without a `tailwind.config` file.

Opacity modifiers work on these too: `text-ink/55` means "ink at 55% opacity".

`.grain::after` overlays an SVG noise texture (an inline `feTurbulence` filter encoded as a data URL). It needs the parent to be `position: relative` (`relative` class) so `inset: 0` fills that section, not the whole page.

`@keyframes marquee` moves from `0` to `-50%`. The logo list is rendered **twice** in a row, so at −50% the second copy sits exactly where the first started, and the loop restarts with no visible jump.

The `prefers-reduced-motion` block switches the marquee off for people who ask their OS for less motion.

</details>

<details>
<summary>@file: src/content/site.ts — explained</summary>

[Open the file](./src/content/site.ts).

Plain exported arrays/objects, no React. Components `import { agents } from "@/content/site"` and `.map()` over them. `@/` is an alias for `src/` set in `tsconfig.json` (`"paths": { "@/*": ["src/*"] }`).

`agents` ends with `as const`. That makes TypeScript treat each `id` as the exact string `"maintenance"` instead of any `string`, which is what lets `Agents.tsx` look up `mocks[agent.id]` without a type error.

Changing copy for the client = editing this file only.

</details>

<details>
<summary>@file: src/components/Hero.tsx — explained</summary>

[Open the file](./src/components/Hero.tsx).

### The rotating word

```tsx
const [index, setIndex] = useState(0);
useEffect(() => {
  if (reduce) return;
  const id = setInterval(() => setIndex((i) => (i + 1) % hero.rotating.length), 2600);
  return () => clearInterval(id);
}, [reduce]);
```

`hero.rotating` has 4 items, so `% 4` walks the index 0 → 1 → 2 → 3 → 0. Example: when `i` is 3, `(3 + 1) % 4 = 0`, so it wraps back to `"maintenance calls."`. The returned function is cleanup: React calls it when the component unmounts so the timer doesn't keep running.

```tsx
<AnimatePresence mode="popLayout" initial={false}>
  <motion.span key={hero.rotating[index]} initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} />
</AnimatePresence>
```

Changing `key` tells React "this is a different element". `AnimatePresence` keeps the old one around long enough to play its `exit` (slide up and out) while the new one plays `initial → animate` (slide up from below). The wrapper has `overflow-hidden` and a fixed height of `1.15em`, so you only ever see one line.

`"use client"` at the top is required because this file uses state, effects and browser animation; files without it (e.g. `Agents.tsx`) render on the server only.

### The backdrop

Three stacked layers inside `HeroBackdrop`: a radial gradient (violet glow at the bottom), a blurred circle that slowly "breathes" (`scale: [1, 1.08, 1]` on repeat), and a grid tilted with `perspective(600px) rotateX(60deg)` to look like a floor receding into the distance. `-z-10` + `isolate` on the section keep it behind the text.

</details>

<details>
<summary>@file: src/components/ProblemStatement.tsx — explained</summary>

[Open the file](./src/components/ProblemStatement.tsx).

`useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] })` gives `scrollYProgress`: **0** when the section's top reaches 80% down the viewport, **1** when its bottom reaches 45%.

The sentence is split into words. Each word gets its own slice of that 0→1 range:

```tsx
range={[i / words.length, (i + 1) / words.length]}
```

The text has 31 words. Word `i = 10` gets `[10/31, 11/31]` ≈ `[0.323, 0.355]`. Inside `Word`, `useTransform(progress, range, [0.15, 1])` maps that slice to opacity: below 0.323 the word is 15% visible, above 0.355 it's fully visible, in between it fades. Result: words light up one after another as you scroll.

`Word` is a separate component because hooks (`useTransform`) can't be called inside a `.map()` loop directly.

</details>

<details>
<summary>@file: src/components/Agents.tsx + AgentMocks.tsx — explained</summary>

[Agents](./src/components/Agents.tsx) · [AgentMocks](./src/components/AgentMocks.tsx)

`const mocks = { maintenance: MaintenanceMock, ... }` maps an `id` to a **component** (not an element). `const Mock = mocks[agent.id]` then `<Mock />` renders it. The capital `M` matters: JSX treats lowercase names as HTML tags.

Alternating layout: `i % 2` is `0` for the 1st and 3rd rows and `1` for the 2nd. When it's `1`, the text gets `md:order-2` and the mock gets `md:order-1`, swapping sides on screens ≥ 768px only (`md:` is a media query, not nesting). On mobile they stack in source order.

In the mocks, each item uses `whileInView` with `delay: 0.3 + i * 0.45`. For the 4 transcript lines that's 0.3s, 0.75s, 1.2s, 1.65s, so the call "plays out"; the work-order strip waits for `0.3 + 4 * 0.45 = 2.1s`.

</details>

<details>
<summary>@file: src/components/Nav.tsx, Reveal.tsx, VoiceDemo.tsx — explained</summary>

**Nav**: `useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 80))` flips a boolean once you've scrolled 80px; `animate` then fades the background colour in.

**Reveal**: a reusable wrapper. Anything inside it fades/blurs/slides up 24px the first time it enters the viewport (`viewport={{ once: true, margin: "-80px" }}` means "trigger 80px after it enters, only once").

**VoiceDemo**: the 56 waveform heights are computed once at module load with a deterministic formula and `Math.round`. Rounding matters: the server and browser must produce *identical* strings for `style.height`, otherwise React reports a hydration mismatch (we hit this: `85.6785642236443%` vs `85.6786%`).

</details>

<details>
<summary>Try one small change</summary>

In `src/app/globals.css`, change `--color-violet: #5740ef;` to `#e0457b`. Predict: which parts of the page change?

Answer: every button, eyebrow label, bullet square, the announcement bar and the Haven chat bubbles, because they all use `bg-violet`/`text-violet`. The hero glow stays purple because it uses a hard-coded hex in an arbitrary `bg-[radial-gradient(...)]` value. Change it back afterwards.

</details>

## Run and check

```bash
npm run dev    # open http://localhost:3000
npm run lint   # tsc --noEmit
npm run build  # static export → out/
```

In CI (`.github/workflows/deploy.yml`) Next projects are detected by `next.config.*` and built with `NEXT_BASE_PATH=/project-365/<dir>` so the preview works under GitHub Pages' sub-path.

## Hero signal field (canvas + Toolcraft)

- The hero background is drawn by one pure function, `drawHavenField(ctx, width, height, params)` in `src/lib/havenField.ts`. It knows nothing about React, so the same file runs in the Toolcraft tuning app (`2026/10/08-haven-hero-tool`) and on the site.
- Everything is driven by a single `phase` value from 0 to 1. Each moving part uses `sin(2π·phase)` or `(index + phase) / rows`, so phase 1 lines up exactly with phase 0 and the loop is seamless without reversing direction.
- `HavenField.tsx` runs a `requestAnimationFrame` loop. It caps devicePixelRatio at 2 to keep the fill cost down and pauses when the hero scrolls out of view (`IntersectionObserver`) or the tab is hidden (`visibilitychange`). With reduced motion on, it draws one still frame.
- `ResizeObserver` keeps the canvas backing size equal to CSS size × DPR. Without that the lines blur on retina screens.
- Toolcraft (`npx @pixel-point/toolcraft create`) generates a standalone creative-tool app with schema controls and PNG export, not website components. Getting the visual into the site means copying the drawing code. Toolcraft's own delivery contract (an acceptance row per control, a performance envelope, a worklog) is a lot of overhead for a one-off visual.
