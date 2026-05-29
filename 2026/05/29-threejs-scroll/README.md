# Three.js Vertical Scroll Carousel

A full-viewport 3D card carousel: cards sit on a vertical cylinder, scroll rotates the ring, and mouse movement reveals depth via camera parallax and group tilt.

## Run

```bash
npm run dev
```

Scroll the page to advance cards. Move the mouse over the canvas to open up the cylinder depth.

## What I learned

### Vertical cylinder layout

Cards are placed on a circle in the **Y–Z plane** (camera looks down +Z):

```ts
const angle = baseAngle + (index * Math.PI * 2) / cardCount;
position.set(0, Math.sin(angle) * radius, Math.cos(angle) * radius);
rotation.x = -angle;
```

At `angle = 0` the card sits front-and-center; cards above/below tilt away on X and recede in Z.

### Scroll without GSAP/Lenis

A sticky full-viewport canvas + tall scroll spacer (`400vh`) drives rotation:

```ts
scrollProgress = scrollY / (scrollHeight - innerHeight);
targetAngle = scrollProgress * Math.PI * 2 * scrollLoops;
```

`baseAngle` lerps toward `targetAngle` each frame in `useFrame` for smooth follow. Fixed card slots wrap visually — no mesh spawning.

### Canvas textures for styled cards

Gradient + headline text is drawn once to an offscreen canvas, then applied as `THREE.CanvasTexture` on a plane. Keeps correct depth sorting vs `Html` overlays from drei.

### Pointer depth reveal

Normalized pointer (−1…1) lerps into:

- Camera XY offset + slight Z push
- Look-at shift for parallax
- Group tilt on X/Y/Z when pointer is over the canvas

Intensity decays on `pointerleave`. Disabled when `prefers-reduced-motion: reduce` is set.

### Tunable constants

Open the **⚙ Carousel** panel (top-right) to tweak live via DialKit:

| Folder | Controls |
|--------|----------|
| **Camera** | `distance` (zoom), `fov`, parallax, hover zoom |
| **Cylinder** | `radius`, `cardCount`, card size, horizontal `offsetX` |
| **Scroll** | `loops`, `heightVh`, `smoothness`, `speed` |
| **Pointer** | Tilt and look-at multipliers |
| **Depth** | `backOpacity`, `frontOpacity`, `opacityFalloff`, back-card `scaleMin` |

Defaults are in [`src/config/carouselDial.ts`](src/config/carouselDial.ts). Camera distance starts at **9.5** (pulled back from the original 7).

## Demo

<!-- Screenshot, GIF, or video link -->
