# Lessons from the Haven site

A one-page marketing site in Next.js (App Router) + Tailwind v4 + Motion. The page is a stack of section components; copy lives in one data file; brand colours live in one CSS theme block.

<details>
<summary>@file: src/components/Button.tsx — explained</summary>

[Source](./src/components/Button.tsx).

This shared component renders a link styled as a CTA, not a form button. It imports the default demo URL and `SiteLink`, which handles internal versus external navigation. Destructured defaults choose `href = DEMO_URL`, `variant = "solid"` and an empty extra class string when callers omit those props. `children` is the label or nested icon rendered inside the link.

`styles[variant]` selects colours from a `Record<Variant, string>`: TypeScript requires an entry for each of `solid`, `outline` and `light`. All variants now share `rounded-md`, which resolves to 0.375rem = **6px** at the site's 16px root font size. Nav, hero, agent-page and final CTAs inherit the same corners without individual edits. The archived split-grid exploration retains its explicit historical `rounded-lg` override.

The common classes also provide an offset keyboard outline and `active:scale-[0.98]`: a 174px-wide link visually presses to `174 × 0.98 = 170.52px` without changing layout width. Colour and transform transitions take 150ms with ease-out. `motion-reduce:transition-none` and `motion-reduce:active:scale-100` disable that motion when requested. Normal height is `h-11` = 44px; caller classes such as the navbar's `h-10` still customise size, not shape. The separate Day / Night controls are native action buttons, not links.

Predict, change, observe: temporarily change `rounded-md` here to `rounded-none`. Answer: the current navbar, hero and agent-page CTA corners all become square together. Restore `rounded-md`; the shared component is the single place to tune this shape.

</details>

## v6: a still image, not a live 3D scene

The current default is the night diorama; the visible Day / Night buttons switch its appearance and `?hero=v6-light` links directly to daylight. This changes the hero and the navbar treatment, not the rest of the site. The artwork carries the realism, while the headline and buttons remain accessible HTML. Old scenes are preserved in Archive. Mobile currently stacks the copy above the desktop artwork; dedicated portrait art is pending.

<details>
<summary>@file: src/components/hero/DioramaHero.tsx — explained</summary>

[Source](./src/components/hero/DioramaHero.tsx).

### Responsibility and imports

This file renders both static hero layouts. It has no timer, canvas, animation loop, or local state. `import type { StaticImageData }` is a TypeScript-only description, removed from the browser JavaScript. The named `hero`, `Button`, and `PhoneIcon` imports reuse the existing copy and controls. Image imports produce metadata and hashed URLs, not inline copies of the image bytes. Next prefixes those URLs for the GitHub Pages base path, unlike a hard-coded `/hero/...` URL. The single default export serves both versions. `HeroLayoutProps` is another type-only import: its optional `tone` and `onSelect` props describe the input without introducing a runtime dependency back on the version registry.

```tsx
export default function DioramaHero({ tone = "dark", onSelect }: HeroLayoutProps) {
  const theme = tone === "light" ? "day" : "night";
  const images = artwork[theme];
  const fallback = images.webp[2];
```

Destructuring extracts the props, and `tone = "dark"` supplies a fallback when the prop is absent. The ternary chooses `"day"` for light tone and `"night"` otherwise. Bracket lookup selects that theme's arrays. Both formats are ordered small → medium → large: index 0 = 768 px, index 1 = 1200 px, index 2 = 1586 px. These are source-image pixel widths, not layout positions or React keys. `fallback` is the largest WebP.

```tsx
function sourceSet(images: StaticImageData[], dimensions = images) {
  return images
    .map(({ src }, index) => `${src} ${dimensions[index].width}w`)
    .join(", ");
}
```

`map` converts each image into a string; destructuring extracts `src`, and the arrow returns the template string. `join` combines them into one HTML attribute. For AVIF we pass `images.webp` as `dimensions`, because this Next/Turbopack version reported AVIF import widths as 100 even though Sharp and the decoded files confirm the actual dimensions. The matching WebP metadata provides accurate width descriptors. Both format arrays must therefore stay in the same order.

### Follow one image to the screen

With `theme="night"`, AVIF index 2 supplies the night image URL and WebP index 2 supplies width 1586. The resulting candidate is `…haven-night-1586….avif 1586w`. `sizes="100vw"` tells the browser the image occupies one viewport width. At 1440 CSS pixels and device pixel ratio 1, the browser can select the 1586-pixel candidate; at 390 CSS pixels and ratio 2, its approximate target is `390 × 2 = 780` pixels. Selection is the browser's decision, not a JavaScript breakpoint, and no images are upscaled during generation.

The element tree is:

```text
section (theme variables and labelled heading)
├── picture (decorative artwork)
│   ├── source (AVIF candidates)
│   └── img (WebP candidates and fallback)
└── content
    ├── intro (lead + Day / Night button group)
    ├── h1, description
    ├── Book a demo + Hear a call
    └── Y Combinator backing
```

An AVIF-capable browser uses `source`; otherwise `img` supplies WebP. It does not need all six files. `loading="eager"` and `fetchPriority="high"` prioritise the hero. Empty `alt` plus `aria-hidden` avoid describing decorative houses to a screen reader; the headline and links remain readable. The fixed headline uses `hero.rotating[3]`: zero-based index 3 is **2am emergencies.**, not the third item. It does not rotate in v6. The primary CTA still uses Button's existing email default, and the secondary link reaches `#voice-demo`.

### Follow a click through the components

The option array is ordered **Day, Night**. Each object supplies a version ID, visible label, and artwork theme. `as const` preserves literal values; `.map()` renders one native button per entry. `key={option.id}` gives React stable identity, while `aria-pressed={theme === option.theme}` exposes the selected state. Native buttons support Tab, Enter and Space; no custom keyboard simulation is needed. `onSelect && (...)` renders the group only when the parent supplied a callback.

Click **Day** → `onClick={() => onSelect(option.id)}` sends `"v6-light"` → the existing `useHeroVersion.select` updates state and the URL → `Hero` passes `tone="light"` into `<Layout tone={version.tone} onSelect={select} />` → the component selects day artwork and the document tone notifies Nav. Both version entries use the same component type, so changing the tone does not unmount the focused button. The hero's section-scoped variables leave lower sections unchanged. There is no separate theme store to fall out of sync with the dev picker. The URL preserves the selection on refresh; there is no site-wide persisted theme preference.

Predict: focus **Day**, press Enter, then Space. Answer: both activate the already-selected day option; the scene stays day and focus remains on the button. Move focus to **Night** to change back.

Only the rendered theme's image is requested on the default page. The existing query-based comparison system first renders the default, then reads the URL after hydration: opening a day comparison link can therefore request night before switching to day. Importing both sets of metadata does not itself fetch both sets of image bytes.

### Predict, change, observe

Temporarily replace `hero.rotating[3]` with `hero.rotating[1]`. Which phrase appears, and does it animate?

<details><summary>Answer</summary>It becomes “leasing leads.” and stays still. Changing an array lookup does not create a timer. Restore index 3 afterwards.</details>
</details>

<details>
<summary>@file: src/components/hero/DioramaHero.module.css — explained</summary>

[Source](./src/components/hero/DioramaHero.module.css).

A CSS module scopes class names to this component. `className={styles.hero}` references its generated class; `[data-theme="day"]` changes four CSS variables for the background and copy, without recolouring the image. The global brand tokens and navbar remain unchanged.

`isolation: isolate` creates a local stacking context: the absolute artwork at `z-index: -1` sits behind the content, but does not disappear behind the rest of the page. The image fills the section with `object-fit: cover`, preserving proportions and cropping when needed. The original is 1586 × 992; in a 1440 × 900 box, the scale is approximately `max(1440/1586, 900/992) = 0.908`, so almost none of the scene is cropped.

```css
font-size: clamp(40px, 4.2vw, 72px);
```

At a viewport width of 1440 px, `4.2vw = 60.48px`, which lies inside the 40–72 px limits. The desktop hero's `min-height: max(760px, min(100svh, 1000px))` reserves at least 760 px and uses the small viewport height up to 1000 px. It is a minimum, not a forced height: content can still grow.

Below 768 px, the hero becomes a column. The picture is first in the DOM but `order: 1` places the decorative artwork after the copy visually. It is no longer absolute, so it reserves space instead of sitting behind small-screen text. At 390 px wide, its `aspect-ratio: 1.3` reserves `390 / 1.3 = 300px` of height. This is a temporary composition until portrait assets arrive. A short static gradient softens the upper image edge; it isn't recalculated by an animation loop.

The `.intro` flex row can wrap on narrow screens so the theme control never squeezes the eyebrow text. The group uses section colours, 44px minimum button heights, a keyboard outline and `[aria-pressed="true"]` styling. That attribute selector makes accessibility state and visible selection agree. Reduced-motion preferences remove the control's colour transitions. CTA corners, focus outlines and pressed feedback now live in the shared Button component rather than this module. There is no entrance animation that hides the headline while JavaScript loads.

### Predict, change, observe

Temporarily change the mobile image aspect ratio from `1.3` to `1`. At 390 px wide, what changes?

<details><summary>Answer</summary>The picture grows from 300 to 390 px tall. `cover` crops the source differently; it does not stretch the houses. Restore 1.3.</details>
</details>

<details>
<summary>@file: src/components/hero/optimize-artwork.mjs — explained</summary>

[Source](./src/components/hero/optimize-artwork.mjs).

Run `node src/components/hero/optimize-artwork.mjs` from the Haven site folder. It uses Sharp already installed through Next; no additional dependency was added. If used outside this project, Sharp would need to be declared explicitly.

`new URL("../../../public/hero/", import.meta.url)` resolves relative to this script, not the terminal directory. Nested loops visit 2 themes × 3 widths × 2 formats = **12 output files**. Each pass reads the original PNG, resizes without enlargement, and writes a separate AVIF or WebP. The originals remain untouched. Re-running intentionally regenerates the derived files.

The quality ternary uses 65 for AVIF and 82 for WebP; quality scales are encoder-specific, so those numbers are not directly comparable. `await` processes outputs sequentially rather than launching twelve memory-heavy encoders together. `effort: 6` spends encoding work once locally instead of asking a visitor's browser to render a 3D scene repeatedly. Full-width results are about 123 KiB day / 106 KiB night in AVIF, and 166 / 131 KiB in WebP. `Math.round(result.size / 1024)` turns output bytes into rounded KiB for the log.

A pre-rendered video could add predetermined motion, but adds decoding and download cost. A real-time scene could support free camera movement, but that is not required for this composition. The still-image route deliberately trades those capabilities for simplicity.

### Predict, change, observe

If a fourth width were added, how many outputs would be generated?

<details><summary>Answer</summary>`2 × 4 × 2 = 16`. Adding output files alone would not make the browser use them: the component imports and candidate arrays would also need updating.</details>
</details>

<details>
<summary>@file: src/components/hero/versions.tsx — explained</summary>

[Source](./src/components/hero/versions.tsx).

The new entries use `Layout`, not `Backdrop`, so `Hero` renders the whole left-aligned section instead of placing an image underneath the old centred text. Both `v6` and `v6-light` reference `DioramaHero`; the latter supplies `tone: "light"`. `Layout?: ComponentType<HeroLayoutProps>` says the optional layout can receive the shared tone and selection callback. A callback type `(id: string) => void` takes one string and returns no value. Existing layouts that don't need these optional props can ignore them. Hero passes the tone to both the layout and the document attribute already watched by Nav. No navbar edits are needed. The string `defaultHeroVersion = "v6"` chooses night for visitors without a comparison query. All seven older entries retain `archived: true` and remain reachable.

Predict: change the default to `"v6-light"` and open `/` without a query. Answer: day renders initially, with dark copy and the existing solid navbar. Restore `"v6"` to keep night as the default.

</details>

```
layout.tsx (font + <html>/<body>)
└── page.tsx
    ├── AnnouncementBar   (fixed, top 40px)
    ├── Nav               (fixed under the bar, turns solid on scroll)
    └── <main>
        ├── Hero → HeroBackdrop
        ├── LogoMarquee
        ├── HomeZoom          (scroll zoom through the H's door into white)
        ├── ProblemStatement → Word × N
        ├── Agents → Reveal + MaintenanceMock / LeasingMock / ComingSoonMock
        ├── VoiceDemo, Capabilities, Testimonials, Process, FinalCta
    └── Footer
```

<details>
<summary>@file: src/app/layout.tsx — explained</summary>

[Open the file](./src/app/layout.tsx).

### What this file is responsible for

Every page is rendered _inside_ `RootLayout`'s `children`. It is the only place that writes `<html>` and `<body>`, so it is where the font and global CSS go.

### Read the code in small pieces

```tsx
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});
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

The guard now skips the shared timer when a version supplies its own `Layout`, including v6. `||` means either reduced motion or a full layout is enough to return early. `version.Layout` is also an effect dependency: switching from a backdrop to a layout clears the old timer. Hooks remain before the conditional return to preserve React's hook order. Prediction: opening `?hero=v5` restarts the shared rotation; switching back to v6 stops it, so the still layout does not re-render every 2.6 seconds.

```tsx
const [index, setIndex] = useState(0);
useEffect(() => {
  if (reduce || version.Layout) return;
  const id = setInterval(
    () => setIndex((i) => (i + 1) % hero.rotating.length),
    2600,
  );
  return () => clearInterval(id);
}, [reduce, version.Layout]);
```

`hero.rotating` has 4 items, so `% 4` walks the index 0 → 1 → 2 → 3 → 0. Example: when `i` is 3, `(3 + 1) % 4 = 0`, so it wraps back to `"maintenance calls."`. The returned function is cleanup: React calls it when the component unmounts so the timer doesn't keep running.

```tsx
<AnimatePresence mode="popLayout" initial={false}>
  <motion.span
    key={hero.rotating[index]}
    initial={{ y: "100%" }}
    animate={{ y: "0%" }}
    exit={{ y: "-100%" }}
  />
</AnimatePresence>
```

Changing `key` tells React "this is a different element". `AnimatePresence` keeps the old one around long enough to play its `exit` (slide up and out) while the new one plays `initial → animate` (slide up from below). The wrapper has `overflow-hidden` and a fixed height of `1.15em`, so you only ever see one line.

`"use client"` at the top is required because this file uses state, effects and browser animation; files without it (e.g. `Agents.tsx`) render on the server only.

### The backdrop

For backdrop-based versions, `version.Backdrop` renders inside the shared section's absolute container. `-z-10` + `isolate` keep it behind the centred copy. For full layouts such as v6, `Hero` returns `<Layout />` plus the comparison tools instead; the static image and left-aligned text live in `DioramaHero`.

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

**Learn more buttons.** Maintenance and Leasing have a `link` in `agents` (in `site.ts`); "Coming soon" doesn't. `{"link" in agent && <Button …/>}` only renders the button when that key exists. `in` checks whether an object _has_ a key, and TypeScript then knows `agent.link` is safe to read. The targets are `MAINTENANCE_URL` / `LEASING_URL` at the top of `site.ts` (placeholders, `#`, until the pages exist).

**The glow behind each mock** (`Frame`): a radial gradient on a box 80px (`-inset-20`) bigger than the card on every side. `closest-side` sizes the gradient so it reaches `transparent` exactly at the box's nearest edge. The first version used `60% 60%` on a box only 24px bigger: the box edge sits at 50%, before the gradient had faded out, so the glow stopped in a faint straight line, like a shadow cut off.

</details>

<details>
<summary>@file: src/components/Nav.tsx, Reveal.tsx, VoiceDemo.tsx — explained</summary>

**Nav**: `useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 80))` flips a boolean once you've scrolled 80px; `animate` then fades the background colour in.

Layout: **Platform · Agents ▾ · Customers** on the left, the logo in the middle, **Book a demo** (an email to hello@usehaven.ai) on the right. The links live in `site.ts` (`navLinks`, `agentPages`, `DEMO_URL`), so a new agent is one entry in `agentPages` and shows up in both menus.

- [`nav/AgentsMenu.tsx`](./src/components/nav/AgentsMenu.tsx): the desktop dropdown. It opens on hover _or_ click and closes on Escape, a click outside, or picking a page. Hover and click fight each other: hovering opens the menu a moment before your click lands, and a plain toggle would close it straight away. `openedByHover` (a `useRef`, so changing it doesn't re-render) remembers "the hover just opened this", and that first click is ignored. The panel sits in a wrapper with `pt-3` rather than `mt-3`: padding is part of the hover area, a margin is a gap the mouse would fall through.
- [`nav/MobileMenu.tsx`](./src/components/nav/MobileMenu.tsx): below 768px (`md:hidden`), a menu button drops a full-width panel with every destination.
- [`SiteLink.tsx`](./src/components/SiteLink.tsx): links starting with `/` go through Next's `<Link>`, which adds the base path the GitHub Pages copy lives under (`/project-365/2026/10/08-haven-site`). A plain `<a href="/agents/leasing">` would skip it and 404 there. Homepage sections are linked as `/#platform`, not `#platform`, so they also work from an agent page.

Two traps hit while building it:

1. `className="hidden sm:inline-flex"` on `<Button>` didn't hide it: Button already has `inline-flex`, and the later rule in the CSS file won. Hiding a wrapping `<span className="hidden sm:block">` avoids the fight.
2. On a phone the page was 431px wide instead of 375px, which pushed the menu button off-screen. The cause was the Agents cards' glow (80px past each card), which stuck out past the right edge. `overflow-x-clip` on the section trims it. `clip` rather than `hidden`, because `hidden` would turn the section into a scroll container.

**Text wrapping** (`globals.css`): every heading gets `text-wrap: balance` (lines of similar length, no lonely last word at any width), and paragraphs and list items get `text-wrap: pretty` (only avoids a single-word last line, cheaper for long text).

**Reveal**: a reusable wrapper. Anything inside it fades/blurs/slides up 24px the first time it enters the viewport (`viewport={{ once: true, margin: "-80px" }}` means "trigger 80px after it enters, only once").

**VoiceDemo**: the 56 waveform heights are computed once at module load with a deterministic formula and `Math.round`. Rounding matters: the server and browser must produce _identical_ strings for `style.height`, otherwise React reports a hydration mismatch (we hit this: `85.6785642236443%` vs `85.6786%`).

</details>

<details>
<summary>Try one small change</summary>

In `src/app/globals.css`, change `--color-violet: #5740ef;` to `#e0457b`. Predict: which parts of the page change?

Answer: every button, eyebrow label, bullet square, the announcement bar and the Haven chat bubbles, because they all use `bg-violet`/`text-violet`. The hero glow stays purple because it uses a hard-coded hex in an arbitrary `bg-[radial-gradient(...)]` value. Change it back afterwards.

</details>

<details>
<summary>@file: src/components/LogoMarquee.tsx + PartnerLogos.tsx — explained</summary>

Source: [LogoMarquee.tsx](src/components/LogoMarquee.tsx), [PartnerLogos.tsx](src/components/PartnerLogos.tsx), names in [site.ts](src/content/site.ts) (`customers`).

### What these files are responsible for

`LogoMarquee` is the "Trusted by" strip under every hero version. `PartnerLogos` maps each customer name to a placeholder SVG wordmark. A name with no mark falls back to plain text, so adding a real customer to `customers` never breaks the strip.

### Read the code in small pieces

Excerpt from `LogoMarquee.tsx`:

```tsx
<div className="animate-marquee flex w-max">
  {[0, 1].map((copy) => (
    <ul
      key={copy}
      aria-hidden={copy === 1 || undefined}
      className="flex shrink-0 gap-16 pr-16"
    >
      …
    </ul>
  ))}
</div>
```

- `[0, 1].map(...)` renders two identical `<ul>` groups side by side.
- `animate-marquee` (in `globals.css`) slides the track from `translateX(0)` to `translateX(-50%)`, then snaps back to 0 and repeats.
- `aria-hidden={copy === 1 || undefined}` hides the duplicate group from screen readers, so each logo is announced only once. `|| undefined` leaves the attribute off the first group entirely instead of writing `aria-hidden="false"`.

**Why `pr-16` matters:** `gap-16` only adds space _between_ items, not after the last one. The earlier version put every logo in one flex row, so the two halves weren't exactly equal and `-50%` stopped half a gap short, which made a visible jump on every loop. Giving each group trailing padding equal to the gap makes the two groups exactly the same width, so `-50%` lands exactly where the second group began.

**Why `REPEAT = 2`:** if one group is narrower than the screen, the right edge goes empty before the loop restarts (the "cutting off"). Repeating the six logos inside each group makes a group 2812px wide, wider than a 1869px viewport.

Excerpt from `PartnerLogos.tsx`:

```tsx
<text … textLength="82" lengthAdjust="spacingAndGlyphs">rentor</text>
```

`textLength` forces the word to exactly 82 SVG units wide, whatever font actually loads. That's what lets each mark have a fixed `viewBox` width without the text spilling out.

### Follow one value

Group width is 2812px and the animation lasts 60s. One loop moves the track by 50% of 5624px = 2812px, so logos drift at about 47px per second. Each logo is `fill="currentColor"`, inheriting `text-white/50` from the track.

### Predict, change, observe

Remove `pr-16` from the `<ul>`. What do you see? <details><summary>Answer</summary>Once per minute the row jumps left by 32px (half of `gap-16`'s 64px) as the animation restarts.</details>

### Swapping in real logos

Add the real SVG as a new entry in `marks` (or as an `<img>` from `public/`) under the same name used in `customers`.

</details>

## Run and check

```bash
npm run dev    # open http://localhost:3000
npm run lint   # tsc --noEmit
npm run build  # static export → out/
```

In CI (`.github/workflows/deploy.yml`) Next projects are detected by `next.config.*` and built with `NEXT_BASE_PATH=/project-365/<dir>` so the preview works under GitHub Pages' sub-path.

## Hero signal field (canvas + Toolcraft)

- The hero background is drawn by one pure function, `drawHavenField(ctx, width, height, params)` in `src/lib/havenField.ts`. It knows nothing about React. The Toolcraft tuning app (`2026/10/08-haven-hero-tool`) keeps its own copy (`src/app/haven-field.ts`), so tuning there and drawing here produce the same picture.
- Everything is driven by a single `phase` value from 0 to 1. Each moving part uses `sin(2π·phase)` or `(index + phase) / rows`, so phase 1 lines up exactly with phase 0 and the loop is seamless without reversing direction.
- `HavenField.tsx` runs a `requestAnimationFrame` loop. It caps devicePixelRatio at 2 to keep the fill cost down and pauses when the hero scrolls out of view (`IntersectionObserver`) or the tab is hidden (`visibilitychange`). With reduced motion on, it draws one still frame.
- `ResizeObserver` keeps the canvas backing size equal to CSS size × DPR. Without that the lines blur on retina screens.

<details>
<summary>@file: src/components/HavenField.tsx + src/lib/havenField.ts — why v1 draws its glow small</summary>

Source: [HavenField.tsx](src/components/HavenField.tsx), [havenField.ts](src/lib/havenField.ts)

### What changed and why

v1 has no hover logic, so its slowness (about 11fps on a real laptop) came from drawing. Every frame it painted three radial gradients over the **whole** canvas, plus a horizon band, using `"lighter"` (additive) blending. On a retina screen with DPR 2, a 1440×900 hero has a 2880×1800 backing canvas, about 5.2 million pixels, so that's roughly 16 million gradient pixels per frame before a single line is drawn.

The drawing is now split in two:

- `drawHavenGlow(ctx, width, height, params)` draws only the soft blobs and the horizon band.
- `drawHavenLines(ctx, width, height, params)` draws the floor grid, signal rings and beams, and dust.

`drawHavenField` still exists and calls both, so anything that wants the whole picture in one call still gets it.

### Read the code in small pieces

Excerpt from `HavenField.tsx`, created once when the effect runs:

```ts
const glow = document.createElement("canvas"); // never added to the page
const glowCtx = glow.getContext("2d");
```

`document.createElement("canvas")` makes an **offscreen** canvas: it exists in memory and gets drawn into, but it's never shown on its own.

Excerpt from `resize`:

```ts
glow.width = Math.max(1, Math.round(width / GLOW_SCALE)); // GLOW_SCALE = 8
```

`Math.max(1, …)` keeps the canvas at least 1px wide, because a 0-wide canvas can't be drawn.

Excerpt from `render`, which runs every frame:

```ts
drawHavenGlow(glowCtx, glow.width, glow.height, params); // small canvas
ctx.drawImage(glow, 0, 0, width, height); // stretch it to full size
drawHavenLines(ctx, width, height, params); // crisp layer at full DPR
```

`drawImage(source, x, y, w, h)` copies a whole canvas onto another one and scales it to `w×h`. The browser smooths it while scaling (`imageSmoothingQuality = "high"`), so a blurry gradient stays a blurry gradient. This only works because the glow has no edges. Drawing the grid lines small and then stretching them would make them visibly soft.

### Follow one value

Take a 1440×900 hero (CSS pixels) on a DPR 2 screen:

- main canvas: 2880×1800 = 5,184,000 pixels
- glow canvas: `round(1440/8)` × `round(900/8)` = 180×113 = 20,340 pixels

The radii in `drawHavenGlow` are fractions of `unit = Math.min(width, height)`. On the small canvas that's `min(180, 113) = 113`, so the big blob's radius is `0.75 × 113 ≈ 85` px. Stretched 8×, that's about 680 CSS px, the same as `0.75 × 900 = 675` at full size. The picture matches; the gradient work is about 250× smaller.

### Measured

The hero's JavaScript drawing time (perf meter, "hero JS") went from 2.9ms to 0.7ms per frame on the VM. The VM's FPS itself barely moved, because it has no GPU and composites any full-screen animated canvas in software. Hiding the canvas entirely only gets the VM to about 24fps. So check real smoothness on a real machine.

### Predict, change, observe

Set `GLOW_SCALE = 64`. What happens? <details><summary>Answer</summary>The glow canvas becomes about 23×14 px. It's still smooth, but the blobs' slow drift starts to step or shimmer, because each small pixel now covers 64 CSS px. 8 is a safe middle ground.</details>

### Alternative

Draw the glow once into a fixed image and only move it with CSS transforms. That's even cheaper, but the three blobs drift independently, so you'd need three layers. The small-canvas approach keeps the drawing code unchanged.

</details>
- Toolcraft (`npx @pixel-point/toolcraft create`) generates a standalone creative-tool app with schema controls and PNG export, not website components. Getting the visual into the site means copying the drawing code. Toolcraft's own delivery contract (an acceptance row per control, a performance envelope, a worklog) is a lot of overhead for a one-off visual.

## Hero versions and the v2 skyline (Three.js)

The hero background can be swapped. Every design is kept as a numbered version in [`src/components/hero/versions.tsx`](src/components/hero/versions.tsx), so we can compare them:

- `?hero=v6` and `?hero=v6-light` show the static night/day dioramas. **v6 is the default.**
- `?hero=v5` and `?hero=v5-light` preserve the moving Three.js neighbourhood.
- Seven older versions (v1 to v5-light) are archived; both v6 layouts are active. Archived versions stay in the code and are still reachable by link.
  - `?hero=v1` shows the signal grid.
  - `?hero=v2` shows the 3D skyline.
  - `?hero=v4` shows the low-rise residential version of the skyline (see "v4 residential skyline" below).
- A switcher pill in the corner appears in dev, or whenever a `?hero=` link is opened. It lists only the active versions (plus the one you're looking at) and an **Archive** button that reveals the rest.

### Showing and hiding the dev overlays

All the floating dev tools (hero switcher, perf meter, **Tune**, the feedback toolbar) are **hidden by default**. Press **`** (backtick, the key left of 1) to show them; press it again to hide them. The choice is remembered in your browser. Adding `?tools` to the URL always shows them. Next.js's own "N" badge is switched off in `next.config.ts` (`devIndicators: false`).

How it works ([`src/lib/devTools.ts`](src/lib/devTools.ts)): one module-level `visible` flag, a `keydown` listener installed once, and a `useDevToolsVisible()` hook that each overlay calls. The listener ignores the key while you're typing in a field, so a backtick in a text box doesn't toggle anything. The hook returns `false` on the first render (the server can't read `localStorage`), then the real value after mount, so the server HTML and the first browser render always match.

<details>
<summary>@file: src/components/hero/HeroVersionPicker.tsx — the Archive toggle, explained</summary>

Source: [`HeroVersionPicker.tsx`](src/components/hero/HeroVersionPicker.tsx), flags in [`versions.tsx`](src/components/hero/versions.tsx)

Each old version carries `archived: true`. The `?` in the type (`archived?: boolean`) means the field is optional: v6 doesn't mention it, so it's `undefined`, which counts as "not archived".

```ts
const activeVersions = heroVersions.filter((v) => !v.archived);
const archivedVersions = heroVersions.filter((v) => v.archived);
```

`filter` builds a **new** array of the items where the function returns `true`; `heroVersions` itself is untouched. `!` flips true/false, so the first line keeps v6 and v6-light. The second keeps v1, v2, v3, v3-alt, v4, v5 and v5-light: seven entries, producing "Archive (7)".

```ts
const visible = showArchive
  ? [...activeVersions, ...archivedVersions]
  : [...activeVersions, ...(current.archived ? [current] : [])];
```

`condition ? a : b` picks `a` when the condition is true. `...` (spread) copies the items of one array into a new one. So with the archive open you get all 9 buttons; closed, you get the 2 active ones, plus the current one if a link opened an archived version (otherwise you'd be looking at v2 with no button showing it's selected).

Why not decide this once when the picker first appears? Because `useHeroVersion` reads `?hero=` _after_ the first render. The picker first sees v6, then a moment later v2. Working it out on every render handles both.

### Follow one value

1. You open `/?hero=v2`.
2. The first render shows v6; the effect in `useHeroVersion` switches to v2.
3. `current.archived` is `true`, so `visible` is `[v6, v6-light, v2]`.
4. The pill shows those three buttons, with v2 highlighted, then **Archive (7)**.

### Predict, change, observe

In `versions.tsx`, remove `archived: true` from v4. What does the pill show on `/`? <details><summary>Answer</summary>v4, v6 and v6-light, then "Archive (6)". Put the flag back afterwards.</details>

</details>

Component tree (excerpt):

```
<Hero>
  <div pointer-events-none -z-10>     ← sits behind all hero text
    <Backdrop />                      ← version.Backdrop (SignalGridBackdrop or CityBackdrop)
  </div>
  <HeroVersionPicker />               ← only when comparing
  …headline, CTA, sub copy…
```

<details>
<summary>@file: src/components/hero/useHeroVersion.ts — explained</summary>

Source: [`useHeroVersion.ts`](src/components/hero/useHeroVersion.ts)

### What this file is responsible for

It picks which hero version to show and keeps the URL shareable. It doesn't know what any version looks like; that lives in `versions.tsx`.

### Read the code in small pieces

```ts
const [id, setId] = useState(defaultHeroVersion);
```

`useState` returns a pair: the current value and a setter. Destructuring (`[id, setId]`) names both of them. The first render always uses the default, `"v6"`.

```ts
useEffect(() => {
  const requested = new URLSearchParams(window.location.search).get(PARAM);
  ...
}, []);
```

The site is a static export, so there's no server to read the query string. The effect runs once (`[]`), after the page loads in the browser, and then switches to the requested version.

```ts
window.history.replaceState(null, "", url);
```

This changes the address bar without reloading the page and without adding a back-button entry.

### Follow one value

1. You open `/?hero=v1`.
2. The first render shows v6.
3. The effect reads `"v1"`, finds it in `heroVersions`, and calls `setId("v1")`.
4. React re-renders with `SignalGridBackdrop`.

`comparing` becomes `true`, so the picker appears.

### Predict, change, observe

In `versions.tsx`, change `defaultHeroVersion` to `"v1"` and open `/` with no query. Which backdrop do you get? <details><summary>Answer</summary>The signal grid. The default only applies when the URL doesn't ask for a version.</details>

</details>

### How the skyline works (mental model)

One function, `createHavenCity(canvas)`, builds a Three.js scene and returns `{ dispose }`. React (`CityBackdrop.tsx`) only creates it when the component mounts and disposes it when the component goes away. That's the same split as v1: pure drawing code plus a thin React wrapper, so Toolcraft can reuse the core.

Each frame draws three things:

1. **Sky**: a full-screen quad drawn first, with a violet glow at the horizon.
2. **City**: one `InstancedMesh`, which draws 500+ boxes in a single draw call. Windows are not geometry; the fragment shader paints them.
3. **Ground**: a plane whose shader draws the street grid and the ripple rings from flashes.

Beacons (`Points`) blink on the tallest roofs.

v4 reuses this same file with `variant: "residential"`; the walkthrough for that is further down.

<details>
<summary>@file: src/components/hero/city/createHavenCity.ts — explained</summary>

Source: [`createHavenCity.ts`](src/components/hero/city/createHavenCity.ts)

### What this file is responsible for

- Lays out the buildings.
- Owns the animation loop, pointer hover and flashes, and resize, pause and cleanup.

The GLSL lives in `shaders.ts`.

### Read the code in small pieces

```ts
const CELL = 1.7;
const COLUMNS = 9;
const ROWS = 34;
const NEAR_Z = 14;
const DEPTH = ROWS * CELL; // 57.8
const FAR_Z = NEAR_Z - DEPTH; // -43.8
```

The city is a grid of 19 columns (−9…9) by 34 rows, with 1.7 world units between building centres. `layoutCity` skips columns −1, 0 and 1 to leave the avenue the camera looks down. It also randomly skips 14% of the remaining cells to make plazas.

```ts
const wrapZ = (z, scroll) =>
  FAR_Z + ((((z - FAR_Z + scroll) % DEPTH) + DEPTH) % DEPTH);
```

This is how the city scrolls forever. Each building has a fixed home `z`. Adding `scroll` moves it toward the camera, and `% DEPTH` wraps it back to the far end once it passes behind the camera. The far end is hidden in fog, so you never see a building pop in.

### Follow one value

Take the building in row 0. Its home is `z = -43.8`.

- With `scroll = 10`: `-43.8 + (10 % 57.8)` gives `-33.8`, so it has moved 10 units closer.
- With `scroll = 60`: `60 % 57.8 = 2.2`, so it sits at `-41.6`. It went past the camera and came back around to the far end.

At `speed = 0.55` units per second, one full lap takes 57.8 / 0.55 ≈ 105 s.

### Hover → flash

- Each frame, `Raycaster.setFromCamera(pointer, camera)` shoots a ray from the mouse position into the scene.
- `intersectObject(city)` returns the `instanceId` of the building under the cursor.
- When that id changes, `flash(id, 1)` sets `flashes[id]` and starts a ripple at the building's base.
- Each frame after that, flashes fade at `dt * 1.4` per second, so a full flash takes about 0.7 s to die out.

The listener is on `window`, not on the canvas, because the hero text sits above the canvas and would block the canvas's own events.

### Lifecycle and accessibility

- Like v1, the animation pauses when the hero is offscreen (`IntersectionObserver`) or the tab is hidden.
- With reduced motion, time and scroll stay frozen. The loop runs only for 2.2 s after pointer input, so hover flashes still work without constant animation.
- `dispose()` removes the listeners and frees GPU buffers. Without it, switching versions would leak WebGL contexts.

### Predict, change, observe

Set `towerHeight: 2` in `defaultHavenCityParams`. What happens to the beacons? <details><summary>Answer</summary>There are more of them, and they sit higher. A beacon goes on any building with `h > 4.6 * towerHeight`, but heights scale by the same factor, so the share of buildings with beacons stays about the same. The roofs are twice as high.</details>

</details>

<details>
<summary>@file: src/components/hero/city/shaders.ts — explained</summary>

Source: [`shaders.ts`](src/components/hero/city/shaders.ts)

### What this file is responsible for

It holds the GLSL strings Three.js compiles for the GPU. A vertex shader runs once per corner and places it on screen. A fragment shader runs once per pixel and picks its colour.

### Windows without geometry

```glsl
vec2 g = vec2(u, vLocal.y) / uWinCell; // uWinCell = (0.12, 0.17) in v2
vec2 id = floor(g);
vec2 f = fract(g);
float pane = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.72);
```

The wall is cut into cells 0.12 units wide by 0.17 tall. `id` says which cell a pixel is in, and `f` says where it sits inside that cell (0–1). Only the middle of each cell counts as glass. `step(a, x)` is 1 when `x >= a`, and multiplying several of them works like an AND.

### Follow one value

A pixel at `u = 0.30`, height `1.0`:

- `g = (2.5, 5.88)`, so `id = (2, 5)` and `f = (0.5, 0.88)`.
- `f.y = 0.88` is above `0.72`, so `pane = 0`. This pixel is the strip of wall between two floors.

`hash(id…)` then gives each window a stable random number. The window is lit when that number is above `1 - uWindowDensity`, which is 0.78 at the default 0.22.

### Fog and flashes

`vDepth` is the distance from the camera. `smoothstep(16, 54, vDepth)` blends far buildings into the fog colour. Flashes add `uFlash` to every pane, and to the edges, scaled by `pow(vFlash, 1.4)` so they fade out softly.

### Alternative

You could model real window geometry or use textures. Thousands of windows would cost far more memory and draw calls; a shader pattern is basically free.

</details>

## Performance readout

When comparing versions (in dev, or with `?hero=` / `?perf` in the URL), a small meter sits above the version pill. See [`HeroPerfMeter.tsx`](src/components/hero/HeroPerfMeter.tsx) and [`perfStats.ts`](src/components/hero/perfStats.ts).

- **fps / ms avg / ms worst:** measured by a separate `requestAnimationFrame` loop that times the gap between frames. That gap includes everything (JavaScript, layout, and the GPU when it is the bottleneck), so it's the honest "does it feel smooth" number. At 60fps each frame has a budget of 1000 / 60 ≈ 16.7 ms. Green means 55fps or more, amber 40–54, red below 40.
- **hero JS:** each backdrop wraps its own render in `performance.now()` and passes the result to `reportHeroFrame()`. That's the backdrop's share of the budget on the main thread. For example, 1.2 ms is 7% of 16.7 ms. GPU time isn't included because GPU work runs asynchronously.
- **draws / tris:** Three.js counts draw calls and triangles in `renderer.info`. `autoReset` is off because we render twice per frame (sky, then city), so we reset the counters once before both renders.

`perfStats.ts` is a plain module variable rather than React state. The backdrop writes to it 60 times a second, and the meter reads it only twice a second, so React re-renders twice a second instead of 60 times.

## v3 split grid (LocalCan-style) and v3-alt

A version can now replace the whole hero instead of only its backdrop. In `versions.tsx`, a version sets either `Backdrop` (drawn behind the shared centred copy) or `Layout` (a whole section). `Hero.tsx` returns early when `Layout` is set. All hooks are called before that early return, because React needs the same hooks in the same order on every render.

- **v3, Split grid** ([`split/SplitHero.tsx`](src/components/hero/split/SplitHero.tsx)): left-aligned copy in a framed card, with a 2×4 grid of animated cells on the right. Below `lg`, the grid stacks under the copy and shows only the first four cells. The `B` and `H` keys trigger the two buttons.
- **v3-alt, Centred grid** ([`GridBackdrop.tsx`](src/components/hero/GridBackdrop.tsx) + [`lib/havenGrid.ts`](src/lib/havenGrid.ts)): the Istos-inspired draft. Cells around the centred copy hold icons that send request "packets" along the grid lines into the copy panel.

<details>
<summary>@file: src/components/hero/split/PixelIcon.tsx — explained</summary>

### What this file is responsible for

It draws one cell's icon. The icon builds up out of chunky blocks, holds, then dissolves back out before the next icon appears. Hovering the cell skips ahead to the next icon.

### The trick

1. Each icon is stroked once onto an offscreen canvas (`sprite`), then that is drawn down to an `n×n` canvas.
2. Downscaling averages the pixels. Any cell whose alpha is above 34 becomes a solid block (`mask`).
3. Materialising plays `IN_STEPS`: 4×4 blocks half revealed, 4×4 full, then 8×8, then 16×16, then the crisp sprite. Each step lasts `STEP_MS` (110 ms), so the motion looks stepped, like pixel art. Dissolving plays the same steps backwards.

### Follow one value

- At 4×4, each block is 52 / 4 = 13 CSS px.
- In the first step, a block shows only if `hash(i, cycle, 5) <= 0.5`, so about half the inked blocks appear.
- `cycle` changes for each new icon, so every reveal uses a different random pattern.

### Why it's cheap

- `draw` exits early when the step key (`icon:n:reveal`) hasn't changed. Each cell repaints about 9 times per transition, not 60 times a second.
- Masks are cached per icon and size.
</details>

<details>
<summary>@file: src/components/hero/split/FacadeMosaic.tsx — explained</summary>

This cell stands in for LocalCan's photo. It draws a procedural, lit apartment facade with solid lilac blocks blinking over it. The blocks are `h / 4` square. A `Set` of block indices keeps about 3–8 of them lit, toggling one every 380 ms, and `pointermove` lights the block under the cursor. To use a real property photo instead, draw it with `drawImage` in place of the window loop.

</details>

## The H zoom (dark hero → white page)

After the hero and the "Trusted by" strip, the screen holds on dark purple with only the house-shaped **H** from the logo. Scrolling grows the H around its little square "door" until the door covers the screen, then a white layer takes over and the light sections begin. Scrolling back up plays it in reverse, because every pose is calculated from the scroll position. No timers are involved.

<details>
<summary>@file: src/components/HomeZoom.tsx — explained</summary>

[Open the file](./src/components/HomeZoom.tsx). It is rendered in [`page.tsx`](./src/app/page.tsx) between `<LogoMarquee />` and `<ProblemStatement />`.

### What this file is responsible for

It renders one tall section (`runway` × 100svh, so 280svh = 2.8 screen heights by default) with a `sticky` box inside it that is exactly one screen tall. While you scroll through the tall section, the sticky box stays pinned. That gives 1.8 screens of scrolling (2.8 − 1) where only the animated pieces move. The H also starts moving _before_ the section reaches the top of the screen, so it is already visible as it scrolls in under the "Trusted by" strip. The page colours live elsewhere: the next section ([`ProblemStatement.tsx`](./src/components/ProblemStatement.tsx)) is already `bg-mist`.

```
section  relative bg-ink, height = runway × 100svh   ← the scroll "runway"
└── div  sticky top-0 h-[100svh]                     ← pinned stage
    ├── motion.div  radial lilac glow     (opacity: glowOpacity)
    ├── motion.div  the H                 (y + scale, origin = door)
    │   └── HomeMark <svg>                two paths copied from Logo.tsx
    └── motion.div  absolute inset-0 bg-mist (opacity: fill) ← the white takeover
```

The white layer is last, so it paints on top of the H. That is why it can hide the H at the end.

### Read the code in small pieces

**1. The H's measurements, copied from the logo SVG.**

```tsx
const MARK_W = 45.2281;
const MARK_H = 56.2437;
const DOOR = { x: 18.0294, y: 47.1738, size: 9.015 };
const ORIGIN_X = ((DOOR.x + DOOR.size / 2) / MARK_W) * 100;
const ORIGIN_Y = ((DOOR.y + DOOR.size / 2) / MARK_H) * 100;
```

The door is the path `M18.0294 47.1738H27.0444…` in [`Logo.tsx`](./src/components/Logo.tsx): a 9.015-unit square. Its centre is at x = 18.0294 + 4.5075 = 22.537 and y = 47.1738 + 4.5075 = 51.681. Divided by the H's size, that is **49.83% across, 91.89% down**. Those percentages become the CSS `transformOrigin`, so `scale` grows the H _around the door_ instead of around its middle.

**2. Every number lives in one object you can tune.**

```tsx
export const homeZoomTuning = {
  lift: { label: "Entry lift (H shows up sooner)", min: 0, max: 0.6, step: 0.01, value: 0.4 },
  enterScale: { …, value: 0.8 },
  size: { …, value: 180 },
  offsetY: { …, value: 0 },
  runway: { …, value: 2.8 },
  zoomStart: { …, value: 0.06 },
  zoomEnd: { …, value: 0.8 },
  curve: { …, value: 2 },
  fill: { …, value: 0.1 },
  glow: { …, value: 0.45 },
};
const t = useTuning("homeZoom", "H zoom", homeZoomTuning);
```

(Excerpt; the real file has a label, min, max and step on every line.) `value` is the default. `useTuning` (see the tuning walkthrough below) returns `{ lift: 0.4, enterScale: 0.8, … }`: the defaults for visitors, or the slider values while you tune.

**3. "How far past the top are we?", in pixels.**

```tsx
const { scrollY } = useScroll();
const scrolled = useTransform(
  [scrollY, sectionTop],
  ([y, top]: number[]) => y - top,
);
```

- `useScroll()` gives the window's scroll position as a _motion value_: a number that updates without re-rendering React.
- `useTransform([a, b], fn)` builds a new motion value from others. `([y, top]: number[])` is _array destructuring_: the current numbers arrive in an array and get names.
- `scrolled` is **negative while the section is still coming up from below**, 0 when its top touches the top of the screen, and `scrollRange` (section height − one screen) when the pinned part ends.

`sectionTop`, `scrollRange`, `viewport` and `maxScale` are measured in a `useEffect` and re-measured by a `ResizeObserver` on `<body>`, because the hero above can change height.

**4. Showing up early: `y` and the entry part of `scale`.**

```tsx
const y = useTransform([scrolled, viewport, tuneTick], ([s, vh]: number[]) => {
  const entry = Math.max(-1, Math.min(0, s / vh));
  return entry * tRef.current.lift * vh + tRef.current.offsetY;
});
// inside scale:
if (s < 0) return enterScale + (1 - enterScale) * (1 + Math.max(-1, s / vh));
```

`entry` runs from −1 (section top at the bottom of the screen) to 0 (section top at the top). Before the stage pins, it scrolls up with the page, and its centre (where the H sits) is half a screen below the section top. `y` pulls the H up by `lift` screens at the start, and that pull shrinks to 0 as the stage pins, so there is no jump. `offsetY` is a fixed nudge for the pinned position. Meanwhile the H grows from `enterScale` (80%) to 100%.

**5. The zoom and the white.**

```tsx
const ramp = (p, from, to) => clamp01((p - from) / (to - from));
const z = ramp(s / range, zoomStart, zoomEnd);
return Math.pow(m, Math.pow(z, curve)); // scale once pinned
const fill = ramp(s / range, zoomEnd - fill * 0.6, zoomEnd + fill * 0.4);
```

`ramp(p, from, to)` reads as: "how far has `p` got between `from` and `to`, as 0 to 1?" With the defaults:

| `scrolled / scrollRange` | what happens                                           |
| ------------------------ | ------------------------------------------------------ |
| below 0 (entering)       | H lifts into place and grows 80% → 100%; glow fades in |
| 0 → 0.06                 | H holds still, full size                               |
| 0.06 → 0.80              | the zoom: scale goes from 1 to `maxScale`              |
| 0.74 → 0.84              | the white layer fades in                               |
| 0.84 → 1                 | solid white, then the page carries on                  |

Why `Math.pow(m, z ** curve)` and not a straight line? Zooming feels even when each bit of scroll _multiplies_ the size by the same amount; `m ** z` does that (1 at z = 0, `m` at z = 1). Raising `z` to `curve` = 2 makes the start gentle and the end fast, like rushing through a doorway.

**6. Why `tuneTick`?** The transform functions read the tuning through `tRef.current`, not as inputs. Motion only re-runs a transform when one of its input motion values changes. When you drag a slider without scrolling, nothing would change, so the effect bumps `tuneTick` by 1, which is an input of every transform, and they all re-run.

**7. How big is "big enough"?**

```tsx
const doorPx = (h * DOOR.size) / MARK_H;
const doorOffsetY = (ORIGIN_Y / 100 - 0.5) * h + tRef.current.offsetY;
const halfCover = Math.max(
  window.innerWidth / 2,
  window.innerHeight / 2 + Math.abs(doorOffsetY),
);
maxScale.set(((2 * halfCover) / doorPx) * 1.15);
```

The door has to end up bigger than the screen. It sits below the H's centre (and `offsetY` can move it further), so it also has to reach the far edge from off-centre. That is what `+ Math.abs(doorOffsetY)` handles. `* 1.15` adds 15% spare.

### Follow one value all the way through

Desktop window, 1440 × 900, all defaults:

1. Height is `clamp(96px, 16vw, 180px)`. 16vw = 230px, more than the 180px max, so **h = 180px**.
2. **Entering:** scroll until the section top is 450px from the top of the screen, so `scrolled` = −450. Then `entry` = −0.5, `y` = −0.5 × 0.4 × 900 = **−180px**, and scale = 0.8 + 0.2 × 0.5 = **0.9**. The stage's centre is at 450 + 450 = 900px, the bottom edge, but the lift draws the H at 720px, fully on screen. Without the lift you'd only see its top half here. That gap was the "plain purple" stretch.
3. `doorPx` = 180 × 9.015 / 56.2437 = **28.85px**. `doorOffsetY` = (0.9189 − 0.5) × 180 = 75.4px. `halfCover` = max(720, 450 + 75.4) = 720. `maxScale` = 2 × 720 / 28.85 × 1.15 ≈ **57.4**.
4. **Pinned:** the section is 2.8 × 900 = 2520px, so `scrollRange` = 1620px. At `scrolled` = 810, the ratio is 0.5, so `z` = (0.5 − 0.06) / 0.74 = 0.595 and `z²` = 0.354. Scale = 57.4^0.354 ≈ **4.2**. Halfway through, the H is only about 4× bigger; the big growth is saved for the end.

### Why we measure progress ourselves

Motion also offers `useScroll({ target, offset })`, which hands you a ready-made `scrollYProgress`. The first version of this file used it. Scale (a function transform) worked, but the opacity transforms were handed to the browser's hardware-accelerated scroll timeline and ended up out of sync: at 90% through, the H showed at 76% opacity and the white layer at 0, so the "white" looked grey. Driving every value through function transforms of our own `scrolled` number keeps all the poses in step.

### Reduced motion

`useReducedMotion()` is `true` when the visitor has asked their OS for less motion. The component then returns a short `h-[70svh]` dark section with a still H: no runway, no zoom.

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
const still = mounted && prefersReduced;
```

Why not just `if (prefersReduced)`? The page HTML is built ahead of time (static export), where there is no OS setting to read, so the HTML always contains the tall animated version. If the browser's first render picked the short version, React would find HTML that doesn't match what it expected (a _hydration mismatch_) and throw it away. `mounted` only becomes `true` in an effect, after that first matching render, so the swap to the still version happens one render later, safely. The section is `aria-hidden` in both branches because it is decoration; screen readers skip straight to the next heading.

### Predict, change, observe

Open the dev preview, click **Tune**, and drag _Entry lift_ from 0.40 to 0. Scroll slowly up to the end of the "Trusted by" strip. What do you see?

<details><summary>Answer</summary>The H shows up later: when the section top is halfway up the screen, only the top half of the H peeks above the bottom edge. That's the old "plain purple" stretch. Click **Reset** to go back to 0.40.</details>

</details>

## Live tuning panel (`Tune` button)

In dev, or on any build with `?tune` in the URL, a **Tune** button sits at the top right. It opens sliders for whatever is on screen: the H zoom, the v2 skyline or the v4 neighbourhood. Moved sliders turn lilac. **Copy values** copies only what you changed, e.g. `{ "homeZoom": { "lift": 0.3 } }`. Paste that into chat and the numbers become the new defaults in code. Values persist in `localStorage` under `haven-tuning`, so a reload keeps them. **Reset** puts one group back to its defaults.

```
layout.tsx
├── {children}  ← HomeZoom, CityBackdrop…  each calls useTuning(id, title, specs)
├── <DevTuner/> ← reads the same store, draws one <input type="range"> per spec
└── <DevAgentation/>
```

<details>
<summary>@file: src/lib/tuning.ts — explained</summary>

[Open the file](./src/lib/tuning.ts).

### What this file is responsible for

A tiny shared store with no library. Components _register_ a group of sliders, and the panel _reads_ them. It isn't React state, because two unrelated components (the panel and, say, `HomeZoom`) need the same numbers.

### Read the code in small pieces

```ts
export type TuningSpec = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
};
export type TuningValues<T extends TuningSpecs> = { [K in keyof T]: number };
```

`TuningValues<T>` is a _mapped type_: "the same keys as `T`, each holding a number". So `useTuning(…, homeZoomTuning)` is typed as `{ lift: number; enterScale: number; … }`, and a typo like `t.lfit` fails the type check.

```ts
const groups = new Map<string, Group>(); // "homeZoom" → { title, specs, values, mounted }
const listeners = new Set<() => void>(); // who to tell when anything changes
```

These live at module level, outside any component, so every importer shares the same `Map`. `mounted` counts how many on-screen components use a group. The panel only lists groups with `mounted > 0`, so after you switch from v2 to v4 the skyline sliders go away.

`setTuning(id, key, value)` clamps the value to `[min, max]`, replaces `group.values` with a new object (`{ ...group.values, [key]: v }`, so React sees a change), then `emit()` saves to `localStorage` and calls every listener.

Saving goes through `persist()`, which **merges** instead of overwriting: it reads what's saved, drops the entries for groups that are registered right now, and adds their current changes. The first version wrote `changedTuning()` straight over the whole key. On a page load, the H zoom group registers first and saves, and at that moment the v5 group doesn't exist yet, so its saved sliders were wiped before it could read them. Merging keeps the values of groups that haven't mounted yet.

### Lifecycle of `useTuning`

1. **First render:** `useState(() => defaultsOf(specs))` returns the plain defaults. The server-built HTML used those too, so hydration matches.
2. **After mount (effect):** if `tuningEnabled()` is false (a normal visitor), stop here. Visitors only ever get the defaults. Otherwise, create the group (merging saved values from `localStorage`), add 1 to `mounted`, and subscribe `sync`, which copies the group's values into state.
3. **Cleanup:** unsubscribe and take 1 off `mounted`, so the panel forgets the group.

### Follow one value

You drag _Entry lift_ to 0.3. `<input>` fires `onChange`, then `setTuning("homeZoom", "lift", 0.3)`. `0.3` is inside `[0, 0.6]`, so it's kept. `emit()` writes `{"homeZoom":{"lift":0.3}}` to `localStorage`. `HomeZoom`'s `sync` runs `setValues`, it re-renders with `t.lift = 0.3`, its effect updates `tRef` and bumps `tuneTick`, and the H moves.

### Predict, change, observe

Run `localStorage.removeItem("haven-tuning")` in the browser console and reload. <details><summary>Answer</summary>Every slider is back at its default: saved values are the only thing that survives a reload.</details>

</details>

<details>
<summary>@file: src/components/DevTuner.tsx — explained</summary>

[Open the file](./src/components/DevTuner.tsx).

- `useEffect(() => { setEnabled(tuningEnabled()); return subscribeTuning(…) }, [])` decides on the client only (the server has no URL or `NODE_ENV` check to make), then re-renders whenever the store emits. `rerender((n) => n + 1)` is a common trick: the number itself is unused, but changing state forces a render.
- `{groups.map(([id, group]) => …)}` takes each `[key, value]` pair from `visibleTuningGroups()` and destructures it in the arrow's parameter.
- `decimals(step)` turns `0.01` into 2 and `1` into 0, so the readout shows `0.40` but `180`.
- `className={moved ? "text-lilac" : undefined}`: `undefined` means "no class at all", which is cleaner than an empty string.
- `navigator.clipboard.writeText(text)` returns a Promise, which is why `copy` is `async`. "Copied" shows for 1400 ms.

It is in production builds too, but renders `null` unless the URL has `?tune`. That lets you tune on the live GitHub Pages site and copy values from there.

</details>

## v4 residential skyline

The client liked v2's skyline but wanted homes, not towers. v4 is the same Three.js scene, the same file and the same hover flash, with a different layout:

- **Plots:** 60% are two-floor houses with pitched roofs. The rest are flat-roofed apartment blocks of 3–5 floors. v2's towers are up to about 10 units tall; here the tallest block is 1.9.
- **Windows:** small panes, two rows per floor like the towers (the client found the first, bigger panes unrealistic), and about 35% of lit windows glow warm cream instead of lilac.
- **Lights:** steady street lamps line the avenue instead of blinking roof beacons.
- **Camera:** lower (2.4 instead of 3.1) and tilted down, so you see the roofs.

v2 is unchanged: its new options all default to its old values.

<details>
<summary>@file: src/components/hero/city/createHavenCity.ts (v4 parts) — explained</summary>

[Open the file](./src/components/hero/city/createHavenCity.ts).

### One function, two variants

```ts
const variants = {
  towers: {
    look: new Vector3(0, 4.6, -10),
    winCell: new Vector2(0.12, 0.17),
    shadeHeight: 9,
  },
  residential: {
    look: new Vector3(0, 1.1, -10),
    winCell: new Vector2(0.12, 0.18),
    shadeHeight: 3,
  },
};
const params = {
  ...(residential ? residentialCityParams : defaultHavenCityParams),
  ...options.params,
};
```

The spread `{ ...a, ...b }` copies `a`, then overwrites with `b`, so slider values win over the variant's defaults. `residentialCityParams` is itself `{ ...defaultHavenCityParams, speed: 0.4, … }`: v2's defaults with a few changes.

### `layoutResidential`

```ts
const house = seeded(i, 2) < p.houseShare;
const floors = house ? 2 : 3 + Math.floor(seeded(i, 3) * (maxFloors - 2));
h: floors * STOREY + 0.1,                        // STOREY = 0.36
roof: house ? (0.35 + seeded(i, 8) * 0.2) * w * p.roofPitch : 0,
```

It walks the same 19 × 34 grid as `layoutCity` and keeps the avenue. `seeded(i, salt)` is a fixed pseudo-random number, so the same plot always gets the same building. With `storeys = 5`, `maxFloors − 2 = 3`, so `floors` is 3, 4 or 5.

- A house is 2 × 0.36 + 0.1 = **0.82** tall.
- A 1.0-wide house with `seeded(i, 8) = 0.5` gets a roof of (0.35 + 0.1) × 1.0 × 1 = **0.45**.
- A block with `seeded(i, 3) = 0.7` gets 3 + ⌊2.1⌋ = **5 floors**, 1.9 tall.

### Roofs: a second instanced mesh

`roofGeometry()` builds one triangular prism by hand: 6 triangles (two slopes and two gable ends), base 1 × 1 at y = 0, ridge at y = 1. `computeVertexNormals()` works out which way each face points. Each pitched building gets one instance, scaled to `(w × 1.06, roof, d × 1.06)` and placed on top of its box at `y = h`. The 6% overhang makes eaves.

```ts
const roofOwners = buildings.flatMap((b, i) => (b.roof > 0 ? [i] : []));
```

`flatMap` returning `[i]` or `[]` is "map and filter in one go". If buildings 0 and 2 are houses and 1 is a block, `roofOwners = [0, 2]`. Roof instance **1** sits on building **2**. The same array is used twice:

- **Hover:** `intersectObjects([city, roofs])` can hit a roof; `roofOwners[instance]` converts it to the building index, so hovering a roof flashes the whole house.
- **Flash:** each frame, `roofFlashes[k] = flashes[roofOwners[k]]` copies the building's flash level to its roof.

### Street lamps

```ts
x: (k % 2 ? 1 : -1) * (1.5 * CELL - 0.2),
z: FAR_Z + Math.floor(k / 2) * CELL + CELL / 2,
```

Lamps alternate sides: even `k` on the left, odd on the right, two per row. Lamp `k = 5` is on the right at x = 2.55 − 0.2 = **2.35**, in row ⌊5/2⌋ = 2, at z = −43.8 + 3.4 + 0.85 = **−39.55**. They are the same `Points` object as v2's beacons, with `uSteady = 1` (a gentle glow instead of a blink) and `uSize = 6` instead of 9.

### Predict, change, observe

Open `?hero=v4`, click **Tune** and drag _Roof pitch_ to 0. <details><summary>Answer</summary>Every roof height becomes 0, so `roofOwners` is empty and no roof mesh is made at all (`roofs` is `null`). The houses become flat two-floor boxes. Drag it to 1.6 for steep A-frames.</details>

</details>

<details>
<summary>@file: src/components/hero/city/shaders.ts (v4 parts) — explained</summary>

[Open the file](./src/components/hero/city/shaders.ts).

- `uWinCell` replaces the old fixed `vec2(0.12, 0.17)`. In v4 it is `(0.12, 0.18)`, two window rows per 0.36-unit floor. (It was `(0.3, 0.36)` at first, one big pane per floor, until the client asked for smaller windows.) A pixel on a front wall at `u = 0.45`, height 0.6: `g = (3.75, 3.33)`, so `f = (0.75, 0.33)`. Both are inside the pane box (0.22–0.78, 0.28–0.72), so it's glass.
- `winColor = mix(winColor, uWarm, step(1.0 - uWarmth, hash(…)))`: with warmth 0.35, a window turns warm when its random number is above 0.65, about 35% of them. v2 passes 0, so `step(1.0, …)` is always 0 and nothing changes there.
- `uShadeHeight` is the height over which walls brighten toward `uGlassTop`. That's 9 units in v2; in v4 it's 3, so a 0.82-tall house still reaches 27% of the way and doesn't look black.
- `roofFragment`: slopes (`n.y > 0.2`) mix between `uRoof` and `uRoofLit` by `n.x`, so the right slope is lighter. Gable ends use `uGable`. Eaves and ridge (`vY` near 0 or 1) get a faint violet rim, and the flash adds to the whole roof.
- `beaconVertex`: `vAlpha = mix(blink, steady, uSteady)`. 0 gives v2's sharp blink; 1 gives v4's steady lamp.
</details>

<details>
<summary>@file: src/components/hero/CityBackdrop.tsx — explained</summary>

[Open the file](./src/components/hero/CityBackdrop.tsx).

One `CityScene` component, two exports: the default `CityBackdrop` (v2, `variant="towers"`) and `ResidentialBackdrop` (v4). `versions.tsx` loads the named one with `dynamic(() => import("./CityBackdrop").then((m) => m.ResidentialBackdrop), { ssr: false })`. `.then` picks the named export out of the loaded module, because `dynamic` expects a component.

The slider specs use `satisfies TuningSpecs`. That checks their shape without widening the type, so the exact keys still come through `useTuning`. Every `value` is read from `defaultHavenCityParams` or `residentialCityParams`, so the defaults have one source of truth.

```tsx
const [params, setParams] = useState(tuned);
useEffect(() => {
  const timer = setTimeout(
    () =>
      setParams((prev) =>
        JSON.stringify(prev) === JSON.stringify(tuned) ? prev : tuned,
      ),
    150,
  );
  return () => clearTimeout(timer);
}, [tuned]);
```

Changing a layout slider means rebuilding the whole scene, which disposes it and calls `createHavenCity` again. A drag fires dozens of `onChange` events, and each one cancels the previous timer, so the rebuild only happens 150 ms after the slider stops (a _debounce_). Comparing as JSON keeps the same object when nothing really changed, so the scene isn't rebuilt for nothing.

</details>

## Brand: Geist and the two hex codes

[`layout.tsx`](./src/app/layout.tsx) loads Geist with `next/font/google`. That downloads it at build time and serves it from our own site, then exposes it as the CSS variable `--font-geist`. [`globals.css`](./src/app/globals.css) puts that first in `--font-sans`. The client's colours are tokens there: `--color-ink: #1e0f26` (dark background, so `bg-ink` everywhere) and `--color-lilac: #c9b5da` (light accent, `text-lilac`). The plum shades are mixed from those two. The 3D scenes can't read CSS variables, so `createHavenCity.ts`'s `palette` repeats the hex codes. The bright violet `#5740ef` stays for buttons, as the client approved.

**Keep violet off dark backgrounds.** `#5740ef` leans blue, ink and lilac lean red-purple. Used as a big glow on ink, the two read as opposing colours (blue at the top of the section, plum at the bottom). So the dark sections glow with the brand's own family instead: `bg-plum-800/80` behind the Voice demo, and a plum + faint lilac radial gradient in the final CTA, centred at 55% so it has faded out before the footer (also `bg-ink`) begins: no seam. Eyebrows take `tone="dark"` on dark sections, which switches them to lilac.

<details><summary>Why not just pass <code>className="text-lilac"</code>?</summary>

That's what the Voice demo did, and it rendered **violet**. `Eyebrow` already had `text-violet` in its class list, so the element got both. Two classes setting the same property don't follow the order you write them in the `class` attribute; the one that comes later _in the generated CSS file_ wins, and here that was `text-violet`. A `tone` prop picks exactly one colour class, so there's nothing to fight.

</details>

**Stale dev cache.** If colours in `npm run dev` don't match `globals.css`, the dev server may be serving an old compiled stylesheet from `.next/`. Ours showed the _previous_ palette (`#0b062a` navy) for days while the live site was correct. Fix: stop the dev server, delete `.next/`, start it again. You can check in the browser console with `getComputedStyle(document.documentElement).getPropertyValue("--color-ink")`.

**"Hear a call" buttons.** The hero and the final CTA both pair "Book a demo" with an outline "Hear a call" button that jumps to `#voice-demo`. The phone is a tiny inline SVG ([`PhoneIcon.tsx`](./src/components/PhoneIcon.tsx)) drawn with `stroke="currentColor"`, so it takes the button's text colour in both themes. In the hero it also gets a frosted backing (`backdrop-blur-sm` plus `bg-ink/40`, or `bg-mist/50` on the light theme), because the street scene keeps moving behind it.

## v5 neighbourhood (dark and light)

Most of Haven's customers manage single-family homes, so v5 is a calm suburban street instead of a city. Detached houses sit on lawns with driveways, hedges and fences. Trees and street lamps line the verges, cars sit on the driveways (never on the road, so the low camera can't drive through one), and every second block has a side street (a T-junction). The road has a kerb and a US-style double centre line, hidden by default (the **Road centre line** slider brings it back) because it made the sub-headline harder to read. Every house uses the same muted palette; an earlier version had a brand-violet "focal" house in every other block, which was dropped. The street drifts towards you endlessly, like v2, along a road that bends gently into the distance. Hovering a house switches its lights on and sends a ripple across the ground (see "Hover styles" below).

The camera sits at pedestrian eye level: 0.8 units up (about 3 m), aiming slightly _upwards_ at a point 2.65 units high, 22 units ahead, through a 47° lens (63° on phones). Warm windows are turned almost off (`warmth = 0.07`) so the scene stays in the purple duotone, and the sway is a little wider (0.58). These values were picked in the Tune panel. Earlier tries: 5.4 units up looking down read as top-down, then 2.6 units up (v2's angle).

### Exploring camera angles (Tune panel)

Open **Tune** (top right, dev or `?tune`), click **▾ H zoom** to fold that group away, and use the camera sliders under **Neighbourhood (v5)**. In world units (one house is about 2–3 units wide):

| Slider                  | Param          | Default | What it does                                                                                                                                                                         |
| ----------------------- | -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Camera height           | `cameraHeight` | 2.6     | How high the eye is. ~1 is a pedestrian; 10+ is a drone.                                                                                                                             |
| Camera forward/back     | `cameraZ`      | 12      | Where along the street you stand. The street's near end is at about 10.4, so above that you're behind it; lower walks you in among the houses.                                       |
| Camera slide left/right | `cameraX`      | 0       | Steps sideways (towards the pavement, or over the front lawns). The aim moves with you, so you still look straight down the street.                                                  |
| Turn left/right         | `lookX`        | 0       | Swings the aim sideways without moving. ±6 points the camera at the houses on one side.                                                                                              |
| Look up/down            | `lookY`        | 2       | Height of the point you aim at, 22 units ahead. Pair a high camera with a negative value to look down.                                                                               |
| Zoom (lens °)           | `fov`          | 46      | Vertical field of view. Lower is telephoto (flatter, tighter); higher is wide-angle (more distortion, more street). Phones always get +16° (`PORTRAIT_FOV_EXTRA`), so 46 becomes 62. |

Example (illustrative, not the default): height 11, look −5, lens 40, turn 3 gives an overhead "drone" view down the street. Turn **Camera sway** to 0 while comparing, so the gentle side-to-side drift doesn't muddy the angle. When you like one, **Copy values** puts just the changed numbers on your clipboard (e.g. `{"suburb": {"cameraHeight": 11, …}}`). Paste them into `defaultHavenSuburbParams` in [`createHavenSuburb.ts`](./src/components/hero/suburb/createHavenSuburb.ts) to make them what visitors see. Slider positions are remembered in your browser (`localStorage`) until you press **Reset**.

<details><summary>Predict, change, observe</summary>Set Camera height to 0.8 and Look up/down to 1.5. What changes? <details><summary>Answer</summary>You're at eye level with the front doors, so the houses tower over you and the sky takes up more of the frame. Because the aim point (1.5) is now above the eye (0.8), you're looking slightly up, so the horizon drops lower on screen than in the default.</details></details>

`?hero=v5` is dark (the default). `?hero=v5-light` is the same scene with the light colours: the hero text turns dark and the nav bar goes solid so it stays readable.

### How to tweak it

| You want to change…                                                   | Edit                                                                                                              | Notes                                                                                           |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Any colour, either theme                                              | [`suburbTheme.ts`](./src/components/hero/suburb/suburbTheme.ts)                                                   | One hex per role (`lawn`, `walls`, `brand`, …). No geometry is involved.                        |
| A house type's shape                                                  | [`suburbHouses.ts`](./src/components/hero/suburb/suburbHouses.ts) `bungalow`, `gableGarage`, `hipPorch`, `corner` | Sizes are `[width, height, depth]` in world units.                                              |
| How often each type appears, road widths, plot size, number of blocks | `street` in the same file                                                                                         | `kinds` is the pool the random picker draws from. List a type twice to make it twice as common. |
| Speed, bend, camera, window lights, trees, auto-flash                 | the **Tune** panel, "Neighbourhood (v5)"                                                                          | Copy values, send them over, and they become the defaults in `defaultHavenSuburbParams`.        |

The four house types:

1. **Bungalow:** single storey with a low hip roof, door and two windows, sometimes a chimney.
2. **Two-storey gable with garage:** garage and driveway on one side.
3. **Two-storey hip with porch:** porch roof on two posts and four windows.
4. **Corner house:** L-shaped, with a gable roof on each wing.

`mirror` flips any house left to right, so the same four types don't look copy-pasted.

<details>
<summary>@file: src/components/hero/suburb/suburbHouses.ts — explained</summary>

[Open the file](./src/components/hero/suburb/suburbHouses.ts).

### Houses are lists of `Part`s

```ts
export type Part = {
  prim: Prim;
  pos: Vec3;
  size: Vec3;
  color: string;
  yaw?: number;
  window?: { lit: boolean; flicker: number };
};
```

A house is just data: an array of simple shapes (`prim`), each with a position, a size and a colour. `pos` is the **base centre**: every shape's geometry starts at y = 0, so `pos[1]` is where its bottom sits. In `hipPorch`, the walls are `box([0, 0, 0], [2.0, 1.9, 1.7], …)`, so they run from y = 0 to 1.9. The roof is placed at `pos: [0, 1.9, 0]`, exactly on top. Each house faces +z, so its front wall is at z = depth / 2 = 0.85, and the windows sit there: `sillWindow(l, -0.62, 0.35, 0.85)`.

**Detail is more boxes, not smoother shapes.** Three helpers return small arrays of parts, and `...` (spread) drops them into the house's list:

- `sillWindow()` = `pane()` plus a thin trim-coloured box just under it (the sill), pushed 0.02 forward so it sticks out of the wall.
- `doorway()` = a frame (slightly bigger box just _behind_ the door, so its edges show), the door, and a flat step in front.
- `chimney()` = the stack plus a cap 0.06 wider.

The car works the same way: wheels, a body, a narrower cabin in the body colour, four glass panels, headlights (`windowLit`) and tail-lights (`brand`, Haven violet, instead of red, to stay on palette). `lampParts()` is a pole, an arm reaching over the road, and a head marked as a lit window, so the existing shader makes it glow with no new code.

Why it stays fast: every box in the whole street, whatever it belongs to, is one _instance_ of the same `BoxGeometry` in one `InstancedMesh`. Adding sills to 28 houses adds ~100 instances but **zero** draw calls. The perf meter still shows 6 draws; triangles went from about 4k to 9k, which is nothing for a GPU.

`pane()` makes one window and decides with the house's own random generator whether it's lit (`rand() < lit`), warm, or a slow blinker.

### `planStreet()`: the T-junctions

```ts
const junction = block % 2 ? 1 : -1;
if (side === junction && j === 0) continue;
```

`continue` skips one loop turn. The first plot (`j === 0`) on one side of each block stays empty, which is where the side street meets the road. `block % 2 ? 1 : -1` alternates the side: block 0 on the left, block 1 on the right, and so on. With 4 blocks × 2 sides × 4 plots = 32 plots, minus 4 junctions, you get **28 houses**.

`seeded(i, salt)` gives the same "random" number every time for the same plot. That way the street looks hand-placed, not chaotic, and it's identical on every visit.

</details>

<details>
<summary>@file: src/components/hero/suburb/createHavenSuburb.ts — explained</summary>

[Open the file](./src/components/hero/suburb/createHavenSuburb.ts).

### 1. Street space

Each house, tree or car is a `Group` with `at` (how far along the road) and `lateral` (how far to the side; negative is left). A left-hand `hipPorch` has `lateral = -(1.15 + 0.45 + 1.3 + 0.85) = -3.75`: half the road, then the pavement, the front garden and half the house's depth.

### 2. Four draw calls for everything

Every `Part` is sorted by its `prim` into one `InstancedMesh` per shape: `box`, `gable`, `hip` and `blob` (tree crowns). Hundreds of parts are drawn in **4 draw calls**, plus the ground and the sky (the meter shows "6 draws"). Per-instance colour, group and window state go in `InstancedBufferAttribute`s, which give each copy its own value.

`roof(ridgeHalf)` builds both roof types from 18 hand-written corner points (6 triangles). With `ridgeHalf = 0.5`, the ridge runs edge to edge, which is a gable. With `0.18`, it stops short, so the ends slope too: a hip roof.

### 3. The endless drift: `place()`

```ts
const z =
  street.far +
  ((((g.at - street.far + travel) % streetLength) + streetLength) %
    streetLength);
const theta = Math.atan(2 * p.curve * (z - p.cameraZ));
pos.set(
  bend(z) + g.lateral * Math.cos(theta),
  0,
  z - g.lateral * Math.sin(theta),
);
```

`travel` grows by `speed × dt` every frame. The double `%` is a _wrap_: once a house goes past the camera, it reappears at the far end in the fog. (The `+ streetLength` keeps the result positive.) `bend(z) = curve × (z − cameraZ)²` makes the road drift sideways the further away it is. `theta` is the road's angle at that point (the slope of `bend`), so houses turn to face the road as it curves.

Worked example with the defaults (`far = −44`, length 13.6 × 4 = 54.4, `curve = 0.004`, `cameraZ = 12`): a house with `at = −30` after `travel = 20`:

- z = −44 + ((−30 + 44 + 20) mod 54.4) = −44 + 34 = **−10**
- bend(−10) = 0.004 × (−22)² = **1.94**, so the road has bent 1.94 units right.
- θ = atan(2 × 0.004 × −22) = atan(−0.176) = **−0.174 rad** (−10°)
- Left house (lateral −3.45): x = 1.94 − 3.45 × cos(−0.174) = **−1.46**, z = −10 − (−3.45 × sin(−0.174)) = **−10.6**

After placing each group, each part's instance matrix is `groupMatrix × local`. The CPU redoes this every frame (about 700 matrix multiplies, well under a millisecond), so the raycaster always tests the real positions. Since the meshes move, `mesh.boundingSphere` is set once to a huge sphere and never recomputed.

### 4. Hover

`raycaster.intersectObjects(meshes…)` returns the first part under the pointer and its `instanceId`. `groupOf[instanceId]` turns that into the group, so a window, a roof or a hedge all mean "this house". Only `house: true` groups flash; trees and cars don't.

### Hover styles

`flashes[i]` rises to 1 while you hover (about 0.17 s) and fades over ~0.7 s after. _What that number does_ is chosen by the **Hover** slider (`hoverStyle`), read in `partFragment`:

| Value | Name                    | What changes                                                                                                                                                                                            |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Wash                    | The original: the whole house blends 30% toward the pale `flash` colour. Reads as a white overlay.                                                                                                      |
| **1** | **Lights on** (default) | Every window goes to 1.3 × `flash`, brighter than a normally lit window, and the walls get up to 28% brighter **in their own colour** (`col *= 1.0 + …`), like light spilling out. Nothing turns white. |
| 2     | Brand                   | Lights on, plus walls and roof turn Haven violet (`brand`), keeping their light and shade (`uBrand * shade`).                                                                                           |

Multiplying (`col *= 1.28`) keeps the hue: purple stays purple, just lighter. Mixing toward a pale colour (style 0) pulls every house toward the same grey-lilac, which is why it looked like a random white overlay.

</details>

<details>
<summary>@file: src/components/hero/suburb/suburbShaders.ts — explained</summary>

[Open the file](./src/components/hero/suburb/suburbShaders.ts).

**Flat colour by face, no textures.** The geometry has no normals at all. The fragment shader works out which way each face points from how the world position changes between neighbouring pixels:

```glsl
vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
float shade = 0.62 + 0.38 * clamp(n.y, 0.0, 1.0) + 0.1 * n.z - 0.05 * n.x;
```

`dFdx` and `dFdy` are those changes across the screen, and their cross product is perpendicular to the face. On a flat face it's the same for every pixel, so the whole face gets one shade:

- roof top or lawn-facing-up (n = 0, 1, 0): 0.62 + 0.38 = **1.0** (lightest)
- wall facing the camera (0, 0, 1): 0.62 + 0.1 = **0.72**
- wall facing +x (1, 0, 0): 0.62 − 0.05 = **0.57** (darkest)

That's the brief's "top lighter, sides darker", with no gradients.

**Windows.** `vWindow` is 1 for window parts. Unlit ones show `uGlass`. Lit ones skip shading (`mix(col, vColor, vGlow)`) so they glow. Blinkers multiply in `step(0.25, sin(time × rate + seed))`, which is on about 58% of the time.

**Roads are drawn, not modelled.** The ground is one big plane. `streetFragment` undoes the drift for each pixel (`along = mod(z − far − travel, length)`), finds the block and whether it's on the junction side, and measures a _signed distance_: negative on tarmac, 0 to 0.45 on the pavement, above that on lawn. `fwidth()` softens the edge over exactly one pixel, so the kerbs stay crisp at any distance.

**Kerb and centre line are paint too.** The kerb is the strip where that signed distance is between 0 and `KERB` (0.07): just outside the tarmac, coloured `kerb`. The centre line uses `lateral` (sideways distance from the middle of the bending road). A pixel is on a line when `abs(abs(lateral) − LINE_GAP)` is under `LINE_HALF`: the inner `abs` folds left onto right, so one test draws both lines, centred 0.055 either side of the middle and 0.044 wide. Far away a line gets thinner than a pixel and would flicker, so the shader draws it one pixel wide but proportionally fainter (`LINE_HALF / lineHalf`).

</details>

<details>
<summary>@file: src/components/hero/SuburbBackdrop.tsx + Hero.tsx tone — explained</summary>

- `SuburbScene({ theme })` is one component for both themes. `SuburbBackdrop` and `SuburbBackdropLight` just pass `"dark"` or `"light"`, so it's a prop, not a second scene. The theme picks a colour set from `suburbThemes` and a matching set of CSS overlays (`overlays.light` uses `bg-mist` and a pale centre glow).
- In [`versions.tsx`](./src/components/hero/versions.tsx), `v5-light` has `tone: "light"`. [`Hero.tsx`](./src/components/Hero.tsx) reads `const light = version.tone === "light"` and swaps classes with template strings, e.g. `` `${light ? "bg-mist text-ink" : "bg-ink text-white"}` ``.
- The nav lives outside the hero, so the hero sets `document.documentElement.dataset.heroTone = "light"`, which renders as `<html data-hero-tone="light">`. [`Nav.tsx`](./src/components/Nav.tsx) watches that attribute with a `MutationObserver` and goes solid, because white links on a pale hero would disappear.

### Predict, change, observe

1. In `suburbTheme.ts`, change dark `brand` from `#5740ef` to `#c9b5da`, set the **Hover** slider to 2, and hover a house. <details><summary>Answer</summary>The hovered house turns lilac instead of violet, and the cars' tail-lights go lilac too. Only colours change; every shape stays put. Change it back.</details>
2. In the Tune panel, set **Road bend** to 0. <details><summary>Answer</summary>`bend(z)` is 0 everywhere and θ = 0, so the street runs dead straight into the distance. Negative values bend it left.</details>
</details>
