# 24 · Word Map — Tooltip with Flip (Smart Placement)

The core interaction concept is **flip behavior** — the tooltip checks available space in its preferred direction and flips to the opposite side if there isn't enough room. Libraries like Floating UI call this the `flip` middleware. The general concept is also called **collision-aware positioning** or **boundary-aware tooltip**.

> "Tooltip with flip behavior — appears above by default, flips below when near the top edge."

---

## v1 — Flex-wrap Tag Cloud

### What it did

Words rendered as pill-shaped monospace tags in a centered `flex-wrap` layout. A fixed definition bar appeared at `bottom: 2.5rem` on hover.

### Techniques

**Layout**

- `flex-wrap` centered inside `max-w-2xl` — words wrapped into rows, never truly scattered.
- CSS jitter via `--jx` / `--jy` custom properties + `translate()` in transform to break the grid feel. Seeded so layout is stable across re-renders.
- `seededRand(seed)` using `Math.sin` — deterministic pseudo-random.

**Proximity animation (rAF loop)**

- `mousemove` → `requestAnimationFrame` → loop over all word refs.
- `getBoundingClientRect()` to find each word's center, `Math.hypot()` for distance.
- `mapDist(d)` linearly mapped distance → `scale` + `opacity` as CSS custom properties applied directly to `el.style`.
- CSS `transition: cubic-bezier(0.34, 1.56, 0.64, 1)` for spring overshoot on scale.
- `resetAll()` on `mouseleave` — cancels rAF, restores idle state.

**Tooltip**

- Fixed `definition-panel` at `bottom: 2.5rem`, centered horizontally.
- `grid-template-rows: 0fr → 1fr` CSS height-transition trick.

### What didn't work

- Flex rows still visible despite jitter — not a real scatter.
- Monospace pill aesthetic read as code tags, not editorial.
- Bottom bar was positionally disconnected from the word.
- No dark mode.

---

## v2 — Shopify-style Editorial Word Canvas

Full redesign: words positioned absolutely across the full viewport, Playfair Display serif, variable size tiers (sm/md/lg), muted base opacity with proximity glow, and a flip tooltip that places itself above or below the word based on available space. Dark and light mode.

### Key techniques

**Absolute scatter layout**

- Each word gets `left: X%` / `top: Y%` from seeded random, edge-padded 8–88% / 8–85%.
- No flex — every word is completely free in the viewport.

**Size tiers**

- `sizeForIndex(i)` assigns `sm` (~55%), `md` (~35%), `lg` (~10%) by seeded random.
- `lg` words are large, bold, and italic — editorial contrast.

**Flip tooltip positioning**

- `positionCard(el)` reads `getBoundingClientRect()` on the hovered element.
- If `rect.top > 160` → card appears **above** (`bottom = window.innerHeight - rect.top + 12`).
- Otherwise → card appears **below** (`top = rect.bottom + 12`).
- Left-edge clamped so card never overflows the right edge of the viewport.

**Theme toggle**

- Sets `data-theme="dark"` on `document.documentElement`.
- CSS custom properties (`--bg`, `--text`, `--card-bg`, etc.) switch all colors.

---

## v2.1 — Polish Pass

Small but meaningful: layout stopped overlapping, the proximity effect got teeth, and the tooltip grew an entrance.

### What changed

**Grid layout (no more overlapping words)**

- Replaced pure seeded-random scatter with an 8×6 grid — each word owns one cell, jitter is applied _within_ that cell.
- Words never stack; the canvas looks full without feeling crowded.

**Stronger proximity effect**

- Radius tightened to 200px (was 220), scale range widened to 0.88→1.4 (was 0.92→1.12), opacity range widened to 0.1→1.0 (was 0.18→1.0).
- The effect is now obvious — nearby words pop, distant ones fade — instead of "is it doing anything?"

**Tooltip entrance animation**

- Card enters with `translateY(14px) scale(0.95)` → `translateY(0) scale(1)`.
- `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) — fast arrival, no bounce. Feels intentional instead of instant.

**Live tuning with dialkit**

- `useDialKit` exposes four sliders: Radius, Max Scale, Min Scale, Idle Opacity.
- Sliders sync into a ref so the rAF loop reads updated values without triggering re-renders.
- Useful for finding the right feel without touching code.

---

## v2.2 — Bug Fix Pass

Six bugs found and fixed. The page looked fine at a glance but was quietly broken underneath.

### What was wrong and what changed

**The proximity effect reset on every hover (render-reset bug)**

Think of it like a painter who carefully shades a canvas, but every time you tap their shoulder they put the brush down and start the shading over from scratch. That's what was happening: every time you hovered a word, React re-rendered the component and overwrote the carefully computed `--scale` and `--opacity` values on all 24 words back to their defaults, wiping out whatever the proximity loop had just set.

The fix: stop putting those values in the React style prop at all. Set them once when the page loads via a `useEffect`, then let the mouse loop own them permanently. React no longer touches them. The painter doesn't get interrupted.

**The Idle Opacity slider did nothing (broken formula)**

The `mapDist` function calculated how opaque a word should be based on distance from the cursor. The formula used a hardcoded number (`0.1`) as the "far away" opacity instead of reading from the slider. So dragging the Idle Opacity dial moved a number in memory that nothing was actually reading.

Fixed to use `tune.idleOpacity` in the formula. The slider now controls what it says it controls.

**A ghost box sat in the top-left corner at all times**

The tooltip card is always in the DOM — it just has `opacity: 0` when nothing is hovered. But a `position: fixed` element with no position specified defaults to the top-left corner (0, 0). It was invisible, but during the fade transition between words it could briefly flash there. Like a door that's supposed to be hidden — it's painted the same color as the wall, but if the light hits it wrong you can still see the frame.

Fixed by setting `left: -9999px` when no word is active, pushing the card fully off-screen.

**The DialKit panel and theme toggle were stacked on top of each other**

Both were anchored to the top-right corner. `<DialRoot />` defaults to `top-right` unless told otherwise. Added `position="bottom-right"` to move the dial panel to the bottom corner, giving each control its own space.

**A hover outline drew a visible rectangle around every word**

The CSS rule for the hovered word included `outline: 1px solid currentColor`. This was the "box" appearing on hover. It was meant as a subtle indicator but read as a selection rectangle. Removed entirely — the word going to full opacity is enough signal.

**The scale animation had a bounce/overshoot**

The easing curve `cubic-bezier(0.34, 1.56, 0.64, 1)` is a spring curve — it overshoots its target and snaps back. For a button click this feels satisfying. For a continuous effect driven by mouse position, it means words wobble slightly past their correct size as the cursor moves, looking jittery rather than fluid. Replaced with `cubic-bezier(0.16, 1, 0.3, 1)` — an ease-out exponential that arrives fast and settles cleanly, no overshoot. Same curve already used on the tooltip entrance.

---

## What I Learned

- Absolute % positioning with seeded random is the simplest way to get a true scatter — no physics engine needed.
- The flip tooltip pattern is trivial to implement manually: one conditional on `rect.top > threshold`.
- CSS custom properties + `data-theme` attribute is clean for dark/light mode with no JS overhead at render time.
- `will-change: transform, opacity` on absolutely-positioned elements keeps the rAF proximity loop smooth.
