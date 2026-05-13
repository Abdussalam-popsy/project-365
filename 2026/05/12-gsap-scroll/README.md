# GSAP scroll lab

Pinned scrub timeline with panel crossfades (Version 1).

## Pages

Open **`index.html`** for the overview, or jump straight to:

- **`version1.html`** — main demo (`script.js`)
- **`version2.html`** / **`version3.html`** — placeholders for alternate experiments

Each version is a separate file so only one ScrollTrigger setup runs at a time.

### GSAP markers

With `markers: true`, overlapping labels at the same scroll position (e.g. `scroller-start` and `start`) are normal — they are layers from **one** trigger, not multiple versions.

## What I learned

### 1) ScrollTrigger markers are per-trigger (not per “moment”)

- **Markers show the start/end of a ScrollTrigger**, not the “beats” inside a scrubbed timeline.
- If you want to see markers for **Step 1 / Step 2 / Step 3** inside one pinned scrub, you add **extra debug-only** `ScrollTrigger.create({ markers: true })` instances that map **timeline progress/time → scroll positions**.

### 2) Why marker labels sometimes “cluster”

- Near the top/bottom of the page it’s normal to see text like `scroller-start`, `start`, and the trigger `id` overlap.
- That overlap is **not multiple versions**. It’s multiple marker labels landing on the same pixel because they’re tied to the same scroll position.
- To keep things readable, you can use **`markers: { indent: ... }`** on the debug-only step markers.

### 3) One page per version keeps experiments clean

- Putting multiple ScrollTriggers/timelines into one page can make debugging confusing (markers stack, multiple pins can fight).
- Splitting into **`version1.html`**, **`version2.html`**, **`version3.html`** keeps each experiment isolated while sharing the same top nav and CSS.

### 4) Scrubbed timeline = “scroll is the playhead”

- Version 1 is built as a single `gsap.timeline({ scrollTrigger: { pin, scrub } })`.
- That means **scroll position directly controls timeline progress**, which is great for studying timing because you can stop anywhere and inspect state.

### 5) Staggered text without SplitText

- At the time of V1, SplitText was a paid GSAP Club plugin, so we used a small manual DOM splitter:
  - Headings (`.panel-heading`) split into **characters** (`.split-char`)
  - Body copy (`.panel-body`) split into **words** (`.split-word`)
- Then we animate those spans with `stagger` on enter and exit to get the “each character/word” feel during scrub.
- Key CSS detail: spans must be **`display: inline-block`** so transforms apply per token.
- **Update (GSAP 3.12+):** SplitText is now free. See V2 for how to use it properly via CDN.

### 6) “Prompting” / debugging approach that helped

- **Start with the simplest, visible debug tool**: `markers: true` on the primary ScrollTrigger.
- When something is unclear (like steps inside the scrub), add **a minimal debug layer** (extra ScrollTriggers with markers), and remove any “custom UI” that competes with the marker overlay.
- Keep everything named with **`id`** so marker labels are self-explanatory.

## Demo

<!-- Screenshot, GIF, or video link -->

---

## Version 2 — Dealing Cards + Highlight Text on Scroll

**Files:** `version2.html`, `script-v2.js`

**What it does:**
- Intro quote fades in character-by-character as you scroll through it (SplitText highlight effect)
- Pinned section where three cards are stacked off-screen below the viewport and "dealt" one at a time into a fanned layout as you scroll
- Outro quote has the same highlight effect on the way out

---

### What I learned in V2

#### 1) SplitText is free now (GSAP 3.12+)

- SplitText, MorphSVG, and other GSAP "Club" plugins are now free as of GSAP 3.12.
- **cdnjs does not have them.** Use the jsDelivr npm mirror:
  ```
  https://cdn.jsdelivr.net/npm/gsap@3.15/dist/SplitText.min.js
  ```
- If the script 404s, `SplitText` is `undefined`. Calling `gsap.registerPlugin(SplitText)` with `undefined` throws and **kills all JS on the page** — including unrelated animations. Always verify the CDN URL works before assuming it's a code bug.

#### 2) CSS color is the "lit" state — GSAP `autoAlpha` controls the dim state

- The highlight effect works by animating `autoAlpha` (opacity) `from` a low value to `1` on each character.
- **The CSS `color` must be the fully-lit state** (e.g. `color: #fff`). GSAP dims from there.
- Trap: if you set `color: rgba(255,255,255,0.18)` in CSS thinking it's the "unlit" look, the lit endpoint is still that dim colour at full opacity. The animation plays but nothing visibly changes. Keep CSS at full brightness and let GSAP handle the fade.

#### 3) `getAttribute` returns strings — always `parseFloat` numeric data attributes

- `heading.getAttribute("data-highlight-fade")` returns `"0.18"` (a string).
- `"0.18" || 0.18` evaluates to `"0.18"` — the fallback never runs, and GSAP receives a string opacity.
- Fix: `parseFloat(heading.getAttribute("data-highlight-fade")) || 0.18`

#### 4) ScrollTrigger fires immediately if the element is already in the viewport on load

- `start: "top 90%"` means "fire when the element's top edge reaches 90% down the viewport." If the element is already above that line when the page loads, the trigger fires instantly — no animation plays.
- To get the reveal-on-scroll feel, **push the text off-screen before the fold**:
  - Make the section taller than the viewport (`min-height: 150vh`)
  - Use `align-items: flex-end` so the text sits at the bottom of that tall section
  - On page load the user sees an empty dark screen; the text is below the fold and enters view as they scroll
- Also widen the scroll range (`end: "bottom 20%"`) so the animation plays over more scroll distance, not just a tiny window.

#### 5) SplitText `onSplit` + `gsap.context()` — the correct modern pattern

```js
new SplitText(heading, {
  type: "words, chars",
  autoSplit: true,         // re-splits automatically on resize
  onSplit(self) {
    const ctx = gsap.context(() => {
      // build ScrollTrigger timeline here
    });
    return ctx;            // return ctx so GSAP can clean up on re-split
  },
});
```
- `autoSplit: true` re-fires `onSplit` whenever the element resizes (e.g. window resize changes line breaks).
- Returning `ctx` from `onSplit` tells GSAP to kill the previous animations before creating new ones — prevents stacked duplicate triggers.
- The `trigger` inside should reference `heading`, not `self.chars`, so the scroll position stays tied to the original element bounds.

#### 6) Dealing cards — positioning and the coordinate maths

The cards are stacked in a hidden "queue" below the viewport using CSS custom properties:

```css
.pin-section.v2-pin {
  --v2-col-first: 65vh;   /* centre-Y of card 1 relative to pin section */
  --v2-card-h: 500px;
  --v2-card-gap: 56px;
}

.v2-card-1 { --rest-y: var(--v2-col-first); }
.v2-card-2 { --rest-y: calc(var(--v2-col-first) + var(--v2-card-h) + var(--v2-card-gap)); }
.v2-card-3 { --rest-y: calc(var(--v2-col-first) + 2 * (var(--v2-card-h) + var(--v2-card-gap))); }
```

Each card is `position: absolute; top: calc(50% + var(--rest-y)); transform: translate(-50%, -50%)` — centred horizontally, queued vertically below 50% of the pin section height.

The GSAP animation then computes the exact `y` delta needed to move each card from its queue position to the fan:

```js
function getStartCenterY(cardSelector) {
  const pin = document.querySelector(".v2-pin");
  const card = document.querySelector(cardSelector);
  const pinTop = pin.getBoundingClientRect().top;
  const cardRect = card.getBoundingClientRect();
  return cardRect.top - pinTop + cardRect.height / 2;
  // = card centre in viewport coords, relative to pin section top
}

// In buildDeal():
y: fanY - getStartCenterY(".v2-card-1")
// fanY = where we want the fan centre to land (fraction of vh)
// subtracting the card's current centre gives the exact translation needed
```

This is viewport-size-safe: it measures actual rendered positions, not assumed pixel values.

#### 7) `gsap.matchMedia()` for responsive animations

- Use `gsap.matchMedia()` instead of a plain `window.matchMedia` listener.
- `mm.add(query, callback)` creates a context that **automatically kills** and re-creates the timeline when the breakpoint changes.
- The callback receives `isNarrow` via the query, letting you pass different fan widths:
  ```js
  mm.add("(max-width: 760px)", () => createDealingTimeline(true));
  mm.add("(min-width: 761px)", () => createDealingTimeline(false));
  ```

#### 8) `document.fonts.ready` → `ScrollTrigger.refresh()`

- Custom fonts load after the initial layout pass. If GSAP measures element heights before fonts render, all position calculations are off.
- Fix: `document.fonts.ready.then(() => ScrollTrigger.refresh())` — recalculates all trigger positions once the correct font metrics are in place.

#### 9) `scrub: 1` vs `scrub: true`

- `scrub: true` = instant follow (playhead jumps straight to scroll position).
- `scrub: 1` = 1 second of lag (playhead eases toward scroll position, feels more organic).
- For the dealing cards effect, `scrub: 1` makes the cards feel like they're physically being dealt rather than snapping.

#### 10) Design detail — card text colour should match the background, not be pure white

- Figma design used `#f9f5e9` (the same cream as the section background) for card text, not `#ffffff`.
- This creates a subtle warmth — text doesn't feel harsh against the bold card colours.
- Match your text to the page background colour when placing text on vivid cards.

---

---

## Version 3 — Ball rolling along an arc

**Files:** `version3.html`, `script-v3.js`

**What it does:**
- Full-viewport black scene with a thick two-tone arc (yellow left, blue right) derived from a Figma circle
- A smiling ball character enters from below-left, rides over the arc peak, and exits below-right as the user scrolls
- The section is pinned with ScrollTrigger; scroll progress drives the ball's position via circle math

---

### What I learned in V3

#### 1) DOM element + MotionPathPlugin `align` breaks with `preserveAspectRatio="slice"`

The first approach was a `<div>` ball outside the SVG, using `motionPath: { align: "#centerline" }` to map SVG coordinates to screen coordinates. This relies on reading the path's Current Transformation Matrix (CTM). When the SVG uses `preserveAspectRatio="xMidYMid slice"` (which scales and offsets the content non-trivially), the CTM mapping silently goes wrong and the ball appears at the wrong position or not at all.

Also: having both `gsap.set({ xPercent: -50, yPercent: -50 })` AND `alignOrigin: [0.5, 0.5]` causes a double-offset — the centering is applied twice.

**Fix:** put the ball *inside* the SVG as a `<g>` element. It shares the same coordinate space as the arc, so no coordinate mapping is needed at all.

#### 2) Parametric circle math is more reliable than MotionPathPlugin for known geometry

MotionPath is great for arbitrary paths, but when the arc is a known circle (center + radius from the Figma data), direct math is simpler and has no failure modes:

```js
const angle = START_ANGLE + progress * (END_ANGLE - START_ANGLE);
const x = CX + R * Math.cos(angle);
const y = CY + R * Math.sin(angle);
ball.setAttribute("transform", `translate(${x} ${y}) rotate(${rot})`);
```

No plugin needed. The `translate(x y) rotate(deg)` SVG transform first rotates the ball around its own centre (rolling feel), then places it on the arc.

#### 3) Reading the arc geometry from the Figma SVG copy

Instead of exporting the arc (which was 3 overlapping Figma shapes), we copied it as SVG. The path `M1764 1044C... Z M-119.443 1044C... Z` is two concentric circle paths using the non-zero fill rule to punch a donut hole. From the numbers:

- **Center:** `(720, 1044)` — 361px *below* the viewport bottom (that's why the arc looks like a road cresting a hill)
- **Outer radius:** `1044`
- **Inner radius:** `839.44`
- **Band thickness:** `~204 SVG units`
- **Centerline radius:** `(1044 + 839.44) / 2 ≈ 941.72`

The entry/exit points of the centerline at `y = 800` (below the viewport) are derived as `x = 720 ± √(941.72² − 244²) ≈ −190` and `1630`.

#### 4) SVG viewBox offset for visual centering

The arc peak was at `y = 102` in a `683`px-tall viewBox, which put it flush near the top of the screen. Changing `viewBox="0 0 1440 683"` to `viewBox="0 -200 1440 683"` adds 200 SVG units of black space above — the arc peak then maps to ~44% from the top of the viewport, feeling centered.

#### 5) `linearGradient gradientUnits="userSpaceOnUse"` for precise placement

Using the default `objectBoundingBox` gradient units on a large, complex arc path produces unpredictable gradient placement. `gradientUnits="userSpaceOnUse"` with explicit `x1="0" x2="1440"` coordinates gives precise control — the color split happens exactly at `x = 720` (the arc's centre).

For a softer look, spread the stops: `35%` yellow → `65%` blue gives a 30%-wide blend zone that feels like it follows the arc's curve rather than cutting straight across.

#### 6) `<image href="...">` inside SVG for external SVG assets

The ball is a separate `ball.svg` file referenced as:
```svg
<g id="v3-ball" transform="translate(-190 800)">
  <image href="images/ball.svg" x="-96.5" y="-96.5" width="193" height="193" />
</g>
```

The `<g>` origin `(0,0)` is the ball's centre (image offset by half its size). Setting the initial `transform` attribute in HTML puts the ball at its off-screen start position before JavaScript runs, preventing a flash. JS then overwrites `transform` on every scroll frame.

#### 7) Lenis + GSAP ScrollTrigger pinning: they don't play well together without deep setup

Three approaches all failed to restore the pinned ScrollTrigger after adding Lenis:

- **GSAP ticker (`gsap.ticker.add`)** — GSAP ticker time is in seconds; Lenis `raf()` expects milliseconds from `performance.now()`. The conversion (`time * 1000`) starts from a different epoch, which breaks Lenis's velocity/easing delta calculation.
- **`autoRaf: false` + GSAP ticker** — inconsistent across Lenis versions; if the option is ignored, Lenis starts its own RAF *and* GSAP calls it again → double-tick → scroll position chaos → pin fires at wrong progress values.
- **Native `requestAnimationFrame` loop** — Lenis ran, but still conflicted with ScrollTrigger's pin spacer system.

**Conclusion:** For scroll-driven animations with `pin: true`, the path of least resistance is no external scroll library. GSAP's `scrub: 1` already gives a smooth, physical scroll feel — the 1-second lag makes the playhead ease toward the scroll position organically. If smooth scrolling is needed alongside pinned sections in a future project, look at GSAP's own **ScrollSmoother** (pairs natively with ScrollTrigger by design).

#### 8) `overflow: hidden` on the pinned section can hide the ball

The first version of `.v3-scene` had `overflow: hidden`. The ball starts at SVG `y = 800` (below the viewport), which maps to below the section's CSS bounds. With `overflow: hidden`, the browser clips it — the ball never appears even mid-scroll. Since the SVG handles its own visual clipping through the viewBox, `overflow: hidden` on the wrapper is unnecessary and should be removed.

---

## Next iterations (ideas)

- **Debug UX**: add a single `DEBUG` flag in `script.js` to quickly toggle step markers on/off.
