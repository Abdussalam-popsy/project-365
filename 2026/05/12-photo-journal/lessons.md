# Lessons Learned: Photo Journal Animation

This file documents the patterns and concepts used to build the photo journal animation in `src/App.tsx`.  
Written for beginners — no assumed knowledge. **Keep this file in sync** when phases or layout constants change.

---

## 1. The Animation Sequence (State Machine)

The whole interaction is driven by a single `phase` state variable plus **`isFlipped`** for the Polaroid’s front vs back (letter).

**Full phase flow (current):**

```
intro → spread → converge → transitioning → polaroid
                                              ↓ (auto-flip via isFlipped)
                                    letter click: isFlipped false
                                              ↓
                                       spread-out → converge → …
                         ↑___________________________________|
                                    (loop; intro does not repeat)
```

| Phase | What you see |
|--------|----------------|
| **intro** | First load only: four photos start stacked at center, **`z` pulled back** (close to “camera”), then spread horizontally while easing **`z` → 0**. |
| **spread** | Strip is fully spread and static; a short dwell, then auto **converge**. |
| **spread-out** | After letter → Polaroid flip-back: photos **fan out** from center again (no intro `z`). |
| **converge** | Photos slide to the **same `x`** and stack via **z-index** (glasses on top). |
| **transitioning** | Strip **fades out** while Polaroid **fades/scales in** — overlap so there is no empty frame. |
| **polaroid** | Strip unmounts; Polaroid is the hero; timers drive auto-flip to letter. |

**`isFlipped`** is separate from `phase`: it only controls the **3D flip** between Polaroid front and diary letter.

**Lesson**: Name every “scene” as a phase. When you add beats (intro, cross-fade), extend the machine instead of bolting on unrelated booleans.

---

## 2. How the Card Stack Effect Works (During Converge)

Each photo has a different **`z-index`**. The “main” photo (index 2, glasses) gets the highest z-index (4).

When all photos animate to the same **`x`** (`CENTER_X`), higher z-index tiles sit on top. The stack reads as **one thick card** without fading the stack itself.

```js
const Z_ORDER = [1, 2, 4, 3];
// Index 2 (glasses) has z-index 4 → always on top when stacked
```

**During `transitioning`**, the **strip** uses **opacity → 0** so it can cross-fade with the Polaroid. That opacity is for the **handoff**, not for the converge illusion.

**Lesson**: z-index + shared `x` = physical deck. Opacity is reserved for the **transition** between two different components (strip vs Polaroid).

---

## 3. Layout Constants — One Ruler for Strip and Polaroid

Magic numbers are grouped so strip and card **share the same vertical story**:

| Constant | Role |
|----------|------|
| `PHOTO_WIDTH` | Width of each strip cell (and Polaroid inner photo width). |
| `STRIP_HEIGHT` | Height of strip cells (and Polaroid inner photo height). |
| `STRIP_TOP` | Distance from viewport top to the **top** of the strip container. |
| `STRIP_CENTER_Y` | `STRIP_TOP + STRIP_HEIGHT / 2` — **vertical center of the strip band**. |
| `PHOTO_CENTER_STEP` | Horizontal spacing between photo **centers** when spread (from design). |
| `SPREAD_X[i]` | Horizontal offset of each photo’s center from viewport center (derived from step + index). |
| `CENTER_X` | `-PHOTO_WIDTH / 2` — shifts a 260px-wide tile so its center sits on the strip’s `left: 50%` anchor. |

The **Polaroid** outer wrapper uses **`top: STRIP_CENTER_Y`** with **`left: 50%` + `translateX(-50%)` + `translateY(-50%)`** so the **card’s vertical center** aligns with the **strip’s vertical center**. Previously the strip used `top: 393` while the Polaroid used viewport `50%`, which caused a visible **vertical jump**.

**Lesson**: If two heroes replace each other on screen, anchor both to the **same computed point** (here: strip midline).

---

## 4. Framer Motion Basics

Framer Motion is a React animation library. The core idea:

```jsx
<motion.div animate={{ x: 100 }} transition={{ duration: 0.5 }} />
```

- **`animate`** — target values.
- **`transition`** — duration, easing, spring, **or per-property** objects (see §14).
- When `animate` changes, Framer tweens to the new target.

**`initial={false}`** — “On first mount, don’t run an entry animation; snap to `animate`.”

**`initial={{ x: CENTER_X, z: 500 }}`** (intro only) — “On first mount, start here, then `animate` pulls to spread + `z: 0`.”

For **`spread-out`**, `initial` sets **`x` only** (stacked); **`z`** is not replayed so the **intro** stays first-load-only.

**Lesson**: `initial` is how you declare different “first frames” per phase or per remount strategy.

---

## 5. Easing Curves

Easing controls acceleration — linear vs natural deceleration, etc.

```js
ease: [0.25, 0.46, 0.45, 0.94]; // cubic-bezier — ease-out style deceleration
```

Intro uses its own longer curve (see `App.tsx`) for a more “luxurious” pull-back.

**Lesson**: Match easing to intent — snappy UI vs slow cinematic intro.

---

## 6. The 3D Card Flip

Three CSS ideas together:

### `transform-style: preserve-3d`

Children live in 3D; without this, nested rotations flatten and break.

### `backface-visibility: hidden`

Hides the face pointed away from the viewer. Back face is pre-rotated `rotateY(180deg)`.

### `perspective`

On a parent (e.g. `1200`) — sets how strong depth feels.

---

## 7. Animating a MotionValue Directly

`flipY` is a `MotionValue`. When `isFlipped` changes, **`animate(flipY, …)`** runs a spring to `0` or `180` without spamming React re-renders for every frame.

---

## 8. The 3D Hover Tilt (`useTilt`)

Mouse position inside the card is normalized to about **-0.5 … 0.5**, then **`useTransform`** maps to **±`maxDeg`** rotation, then **`useSpring`** smooths it.

**Lesson**: Normalize input, map to output, smooth — same pattern for many interaction micro-animations.

---

## 9. Tilt + Flip Together (Nested 3D)

Outer `motion.div`: tilt (`rotateX` / `rotateY` from mouse).  
Inner `motion.div`: flip (`rotateY` from `flipY`).  
Both layers need **`transform-style: preserve-3d`** so they compose.

---

## 10. AnimatePresence

Lets the Polaroid play an **`exit`** animation before unmount when `showPolaroid` becomes false. **`key="polaroid"`** helps AnimatePresence track identity.

---

## 11. Managing Timers in React

One **`timerRef`**, always **`clearTimer()`** before scheduling a new timeout — avoids stale callbacks firing after the user has moved to another phase.

---

## 12. `onAnimationComplete` — One Driver, Many Phases

Framer calls this when the element reaches its **`animate`** target for the current animation.

Only **one** strip tile (index **`2`**, the glasses / hero stack) runs the callbacks so the timeline **does not fire four times**.

Current wiring (simplified):

```text
i === 2 &&
  phase === 'intro'        → handleIntroDone
  phase === 'converge'     → handleConvDone
  phase === 'spread-out'   → handleSpreadOutDone
```

Each handler updates `phase` and/or schedules the next timeout.

**Lesson**: Pick a single “lead” element for “animation finished” gates.

---

## 13. Google Fonts in Vite

`@import` fonts at the top of `index.css`; always include a **fallback** `fontFamily` in styles.

---

## 14. The `transitioning` Phase — Cross-Fade

**Problem**: Unmount strip → mount Polaroid reads as a **hard cut** or flash.

**Fix**: A short phase where **both** render: strip **`opacity → 0`**, Polaroid **`opacity / scale` in**. Then switch to **`polaroid`** and unmount strip.

```js
const showStrip = phase !== "polaroid";
const showPolaroid = phase === "polaroid" || phase === "transitioning";
```

---

## 15. Per-Property Transition Durations

Strip tiles animate **`x`**, **`z`**, and **`opacity`** with different durations depending on phase (e.g. intro vs converge). Opacity fades should usually be **shorter** than position so the overlap feels crisp, not muddy.

---

## 16. Expanding the State Machine

Phases were added incrementally: **`spread-out`**, **`transitioning`**, **`intro`**.  
New phases should only adjust **`showStrip` / `showPolaroid` / `animate` / `initial`** as needed; avoid duplicating timer logic.

---

## 17. Intro Phase — Depth on First Load Only

- Strip container gets **`perspective: 1200`** (shared with intro depth).
- Each **`motion.div`** in **`intro`**: `initial` includes **`z: 500`**, **`animate`** includes **`z: 0`** with **`x`** spreading out.
- **`handleIntroDone`**: `setPhase('spread')`, then same **1200ms** dwell → **`converge`** as before.

Loop restarts use **`spread-out`** without the intro **`z`** replay.

---

## 18. FLIP vs What This Project Does

**FLIP** (First, Last, Invert, Play) measures layout before/after a change, applies an inverse transform for one frame, then animates to identity — great for **list reorder** or **shared element** continuity.

**This app** mostly uses **explicit targets** (`SPREAD_X`, `CENTER_X`, Framer **`x` / `z` / `opacity`**), not measured FLIP. That is simpler to reason about; the tradeoff is described in §19.

---

## 19. The “Last 2%” — Stack → Polaroid (Match-Cut Feel)

**Is it possible to get closer to reference-quality “one object, no mush”?**  
**Yes**, with a spectrum of effort:

| Approach | What it improves | Cost |
|----------|------------------|------|
| **Tune overlap only** | Shorter cross-fade, polaroid enters **earlier** in the last part of converge, matched **easing** with strip motion. | Low — still two DOM trees. |
| **Geometry lock** | Same outer **size, radius, shadow** during overlap; avoid fading **motion-blurred** imagery. | Low–medium. |
| **Single-handoff** | Only the **top** stack image fades / morphs while others hide first — less double exposure. | Medium. |
| **Shared layout / layoutId (Framer)** | One logical element “flies” from stack to Polaroid position. | Medium–high; API constraints. |
| **True FLIP or one canvas/WebGL hero** | Strongest continuity; highest build cost. | High. |

**Why the current cross-fade can read softer than inspiration:** Two independent components (four tiles vs Polaroid) + **opacity** overlap; the eye can still read **dissolve** even when timed well. Reference work often **time-aligns motion and opacity to one curve** or uses a **single surface** so there is no “two paintings” moment.

**Practical next step when you implement:** Decide whether you want **low-effort tuning** (durations, delay, easing, which layer fades) or a **structural** change (layoutId / solo top tile). Both are valid; the second category is where “match cut” lives.

---

## Summary: Key Concepts

| Concept | What it does |
|--------|----------------|
| `phase` + `isFlipped` | Scene + Polaroid flip, separate concerns |
| `STRIP_*` + `STRIP_CENTER_Y` | Shared vertical anchor for strip and Polaroid |
| `intro` vs `spread-out` | Depth intro once; loop fan-out without `z` replay |
| `motion.div` + `animate` / `initial` | Declarative motion per phase |
| `z` + strip `perspective` | First-load “pull back from camera” |
| `Z_ORDER` | Stack reads as one deck at converge |
| `transitioning` | Overlap strip + Polaroid instead of hard cut |
| Per-property `transition` | Different timings for `x`, `z`, `opacity` |
| `onAnimationComplete` (index 2) | Single timeline driver |
| `timerRef` + `clearTimer` | Safe sequencing between beats |
| FLIP (optional future) | Measured continuity — not required for current approach |
| §19 “last 2%” | How to push stack → Polaroid toward reference precision |
