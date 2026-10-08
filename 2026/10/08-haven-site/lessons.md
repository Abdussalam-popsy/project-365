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

## Hero versions and the v2 skyline (Three.js)

The hero background can be swapped. Every design is kept as a numbered version in [`src/components/hero/versions.tsx`](src/components/hero/versions.tsx), so we can compare them:

- `?hero=v1` shows the signal grid.
- `?hero=v2` shows the 3D skyline (the current default).
- A switcher pill in the corner appears in dev, or whenever a `?hero=` link is opened.

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
`useState` returns a pair: the current value and a setter. Destructuring (`[id, setId]`) names both of them. The first render always uses the default, `"v2"`.

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
2. The first render shows v2.
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
const wrapZ = (z, scroll) => FAR_Z + ((((z - FAR_Z + scroll) % DEPTH) + DEPTH) % DEPTH);
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
vec2 g = vec2(u, vLocal.y) / vec2(0.12, 0.17);
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
