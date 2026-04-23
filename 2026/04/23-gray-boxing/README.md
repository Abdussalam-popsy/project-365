# 23 — Grey Boxing

> A scroll-reactive bar animation where a single "peak" line travels left-to-right as you scroll from top to bottom. Surrounding bars cascade downward based on their distance from the peak, creating a spotlight or wave-crest effect.

---

## How it was built

### Stack
- **React + TypeScript** (Vite)
- **[Dialkit](https://github.com/dialkit/dialkit)** — live parameter dials overlaid on the page, zero config
- Vanilla `requestAnimationFrame` loop — no animation library

### Architecture

```
scroll event → targetProgress (0–1)
                      ↓
           rAF tick: lerp currentProgress → targetProgress
                      ↓
           peakIndex = currentProgress × (count − 1)
                      ↓
           for each bar i:
             dist  = |i − peakIndex|
             t     = max(0, 1 − (dist / spread) ^ falloff)
             h     = minH + (maxH − minH) × t
```

**Key insight:** store `currentProgress` (0–1), not `peakIndex` directly. Deriving the peak index inside the tick means changing the `lines` count live (via a dial) never breaks the lerp — the progress value stays valid regardless of bar count.

### Parameters (all live-adjustable via Dialkit)

| Param   | Default | What it does |
|---------|---------|--------------|
| lines   | auto    | Number of bars (auto-computed from viewport width) |
| minH    | 4px     | Resting height of bars far from the peak |
| maxH    | 160px   | Height of the peak bar |
| spread  | 20      | How many bars on each side are pulled up (cascade width) |
| falloff | 2.0     | Shape of the curve: 1 = triangle, 2 = smooth bell, 4+ = sharp needle |
| lerp    | 0.08    | Smoothing factor — low = snappy, high = laggy/dreamy |
| opacity | 0.5     | Bar opacity |

### Line count
`computeN()` fills the full viewport width minus padding:
```ts
Math.floor((window.innerWidth - 2 * PADDING_X) / (LINE_W + GAP))
```
A `ResizeObserver` on `document.documentElement` keeps the count live on window resize.

---

## Iteration history

### v1 — Gradient slide
The first attempt animated a height gradient sliding left-to-right. Each bar's height was computed from two power curves (one peaking at the start, one at the end) blended by scroll progress. The result read as a gradient shifting — smooth but not particularly focused.

### v2 — Traveling peak (final)
Replaced the gradient model with a single traveling peak. Instead of two static curves, the peak itself moves. The `falloff` exponent controls the shape of the cascade around it. Small spread + high falloff = a sharp moving spike. Wide spread + low falloff = a rolling swell.

The `power` parameter (from v1) was split into two more expressive controls: `spread` (width of influence) and `falloff` (sharpness of curve).

---

## What I learned

**1. Float peakIndex > integer peakIndex**
Keeping `peakIndex` as a float (e.g. 47.3) makes the peak travel smoothly between bars. Snapping it to an integer creates visible jumps at low bar counts.

**2. Lerp the progress, not the derived value**
Lerping `currentProgress` and computing `peakIndex` from it every frame means the animation is always "unit-independent." Resize the window mid-scroll and the peak stays at the correct proportional position.

**3. `Math.pow(dist / spread, falloff)` is expressive**
This single formula covers a huge range of shapes. Falloff=1 gives a linear cone (triangular profile). Falloff=2 is approximately Gaussian (smooth bell). Falloff=4+ creates a tight needle that drops off almost vertically outside the peak. It's a surprisingly versatile primitive.

**4. `Math.max(0, ...)` is essential**
Without clamping the result of `1 - pow(...)`, bars far from the peak can go negative (especially at low spread), producing negative heights. One `Math.max(0, ...)` fixes it.

**5. Dialkit for live parameter exploration**
Being able to scrub `spread` and `falloff` in real time while scrolling made it immediately obvious what each parameter does. It shortened the "intuition building" loop from minutes to seconds.

---

## Demo

_scroll from top to bottom — the peak travels left to right_

```
scroll=0    |█|▇|▅|▃|▂|▁|▁|▁|▁|▁|   peak at left
scroll=0.5  |▁|▁|▂|▃|▅|█|▅|▃|▂|▁|   peak centered
scroll=1    |▁|▁|▁|▁|▁|▂|▃|▅|▇|█|   peak at right
```
