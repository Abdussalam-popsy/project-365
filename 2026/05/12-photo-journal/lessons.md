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
| **transitioning** | Strip **fades out** (opacity → 0, 300 ms) while Polaroid **fades/scales in** (400 ms) — overlap so there is no empty frame. |
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

**During `transitioning`**, the **strip** uses **opacity → 0** (duration 0.3 s, uniform across all tiles) so it can cross-fade with the Polaroid. That opacity is for the **handoff**, not for the converge illusion.

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

## 14. The `transitioning` Phase — Cross-Dissolve

**Problem**: Unmount strip → mount Polaroid reads as a **hard cut** or flash if not bridged.

**Fix**: A short phase (~350 ms) where **both** render simultaneously:
- Strip `opacity → 0` over 300 ms (uniform for all tiles).
- Polaroid `opacity: 0 → 1, scale: 0.9 → 1` over 400 ms.
- The overlap means the eye sees a continuous presence rather than a blank frame.

```js
const showStrip = phase !== "polaroid";
const showPolaroid = phase === "polaroid" || phase === "transitioning";
```

**Note (match-cut experiment, reverted):** A hard-snap variant was tried — non-hero tiles snapped to opacity 0 instantly, hero tile lingered 50 ms, and the Polaroid frame materialised via `borderRadius` / `backgroundColor` morph on `motion.div` inner elements. It was reverted because it exposed a visible positional jump at the handoff. The soft cross-dissolve masks that geometry better.

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

## 19. The “Last 2%” — Stack → Polaroid Handoff

**Current approach:** Cross-dissolve — strip opacity out (300 ms), Polaroid opacity/scale in (400 ms), ~350 ms overlap window.

**The spectrum (for reference):**

| Approach | What it improves | Status |
|----------|------------------|--------|
| **Cross-dissolve** ✅ **(current)** | Soft overlap masks geometry difference between strip and Polaroid. | Shipped. |
| **Match-cut + radius morph** | No double-exposure; frame materialises around photo; radius tells continuity story. | **Tried and reverted** — exposed a visible positional jump. |
| **Shared layout / `layoutId`** | One logical element “flies” from stack to Polaroid — Framer handles geometry automatically. | Not yet attempted. |
| **True FLIP or single canvas hero** | Strongest geometric continuity; highest build cost. | Not yet attempted. |

**Why match-cut was reverted:**
The hard-snap variant (non-hero tiles instant opacity 0, hero tile 50 ms linger, Polaroid frame materialising via `borderRadius` / `backgroundColor` morph) exposed a visible positional jump. The strip's stacked tile and the Polaroid card do not share an identical visual center — the cross-dissolve's opacity overlap was masking that difference. Removing the overlap made the geometry mismatch visible.

**`layoutId` (deferred — not attempted yet):**
Framer Motion `layoutId` would let the inner photo “fly” from its strip position to its Polaroid position. Potential blockers to investigate:
- The strip container has `perspective: 1200`; the Polaroid has nested `perspective` + `transformStyle: preserve-3d`. Nested contexts can cause `getBoundingClientRect` to mis-report.
- Strip tiles are not individually wrapped in `AnimatePresence` — structural refactor needed.

**If you want to attempt `layoutId` later:**
1. Wrap strip tiles in their own `AnimatePresence`.
2. Add a `LayoutGroup` spanning both the strip and `PolaroidCard`.
3. Add `layoutId=”hero-photo”` to strip tile 2's outer `motion.div` and the inner photo element in `PolaroidCard`.
4. Have strip tile 2 exit (unmount) at the same instant the Polaroid inner photo enters — Framer animates between them including `borderRadius`.

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
| `transitioning` | Cross-dissolve: strip fades out, Polaroid fades/scales in — overlap masks geometry |
| Per-property `transition` | Different timings for `x`, `z`, `opacity` |
| `onAnimationComplete` (index 2) | Single timeline driver |
| `timerRef` + `clearTimer` | Safe sequencing between beats |
| FLIP (optional future) | Measured continuity — not required for current approach |
| §19 “last 2%” | How to push stack → Polaroid toward reference precision |
