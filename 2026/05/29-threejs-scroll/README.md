# Three.js Vertical Scroll Carousel

A full-viewport 3D card carousel: cards sit on a vertical cylinder, scroll rotates the ring, and mouse movement reveals depth via camera parallax and group tilt.

## Run

```bash
npm run dev
```

Scroll the page to advance cards. Move the mouse over the canvas to open up the cylinder depth. Open the **⚙ Carousel** panel (top-right) to tweak live via DialKit — the panel stays visible on the [live demo](https://abdussalam-popsy.github.io/project-365/2026/05/29-threejs-scroll/) via `productionEnabled` on `<DialRoot />`.

## What I learned

### 1) A flat Y–Z ring hides the back of the cylinder

The first layout put every card at `x = 0` on a circle in the **Y–Z plane**:

```ts
y = sin(angle) * radius;
z = cos(angle) * radius;
```

That gives a convincing vertical stack with tilt — but the back hemisphere sits **directly behind** the front card from the camera’s point of view. You never see the “other side” of the ring.

**Fix:** add horizontal spread so the ring is truly 3D:

```ts
x = cos(angle) * radius * sideSpread;
y = sin(angle) * radius;
z = cos(angle) * radius;
```

Cards at `angle ≈ π` now sit at negative **x** (left) and negative **z** (back) — the far side of the cylinder peeks into the empty space beside the stack.

### 2) `revealAngle` opens the ring toward the camera

A base **Y rotation** on the whole ring (`revealAngle`, default ~−0.28 rad) yaws the cylinder so you look slightly *into* the arc, not dead-on. Pointer tilt adds on top of this base angle.

Opacity, scale, and `renderOrder` all use **camera-facing depth** after yaw:

```ts
worldZ = -x * sin(yaw) + z * cos(yaw);
frontness = (worldZ + radius) / (2 * radius);
```

Without this, back cards could sort or fade using local Z only — wrong once the group rotates.

### 3) Scroll without GSAP/Lenis

A sticky full-viewport canvas + tall scroll spacer (`heightVh`, default `400vh`) drives rotation:

```ts
scrollProgress = scrollY / (scrollHeight - innerHeight);
targetAngle = scrollProgress * Math.PI * 2 * loops * speed;
```

`baseAngle` lerps toward `targetAngle` each frame in `useFrame`. Fixed card slots wrap visually — no mesh spawning. Native scroll avoids the pin/smooth-scroll conflicts called out in the gsap-scroll lab.

### 4) Canvas textures beat `Html` overlays for cards

Gradient + headline text is drawn once to an offscreen canvas → `THREE.CanvasTexture` on a plane. Correct depth sorting, no DOM/CSS 3D fighting the WebGL layer. Cards use `depthWrite: false` and z-based `renderOrder` for clean transparency stacking.

### 5) DialKit for live tuning — including production

All tunables live in [`src/config/carouselDial.ts`](src/config/carouselDial.ts). DialKit’s `<DialRoot />` **hides in production by default** (`productionEnabled` defaults to dev-only).

To keep sliders on the GitHub Pages URL:

```tsx
<DialRoot position="top-right" defaultOpen theme="dark" productionEnabled />
```

Without `productionEnabled`, the panel renders locally but disappears in `vite build` output.

### 6) Pointer depth reveal

Normalized pointer (−1…1) lerps into camera XY offset, look-at shift, and group tilt. Intensity ramps on canvas enter and decays on leave. Disabled when `prefers-reduced-motion: reduce`.

### DialKit folders

| Folder | Controls |
|--------|----------|
| **Camera** | `distance`, `fov`, parallax, hover zoom |
| **Cylinder** | `radius`, `cardCount`, card size, `offsetX` |
| **Scroll** | `loops`, `heightVh`, `smoothness`, `speed` |
| **Pointer** | Tilt and look-at multipliers |
| **Depth** | `backOpacity`, `frontOpacity`, `sideSpread`, `revealAngle`, `scaleMin` |

## Demo

https://abdussalam-popsy.github.io/project-365/2026/05/29-threejs-scroll/
