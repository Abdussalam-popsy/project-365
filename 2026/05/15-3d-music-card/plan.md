# 3D Music Card — Plan

## What exists now

- React + Vite + TypeScript + Tailwind v4
- Three.js via `@react-three/fiber` + `@react-three/drei`
- `Lovable-card.glb` — single mesh, custom UV-mapped texture (front + back faces mapped, sides clipped/no repeat)
- `locked-in.mp3` — looping audio track
- `dialkit` + `motion` installed

**Current interaction:** Hold anywhere on the canvas to play music + trigger colored accent lights. Release to stop. Drag to orbit while holding = music keeps playing.

**Current scene:** Three colored accent lights (purple, pink, warm orange) lerp in on active state. Background shifts from near-black to deep purple. Card emissive tints purple when active. All transitions are frame-rate-independent lerps.

**DialKit panel** (top-right ⚙) exposes:
- Lighting: ambient, hemisphere, key, fill, exposure
- Accents: purple/pink/warm color pickers + intensity multiplier

---

## Roadmap

### Phase 1 — Color + Controls + Export (no new assets needed)

- [ ] Card base color picker in DialKit → `material.color.set(hex)` (multiplies over existing texture, instant tint)
- [ ] Metalness + roughness sliders → surface finish from matte to mirror
- [ ] `preserveDrawingBuffer: true` on the Canvas (required for screenshot)
- [ ] Download button (HTML overlay) → `gl.domElement.toDataURL('image/png')` triggered download
- [ ] Camera presets — 5 named positions (Front, Hero 3/4, Low Drama, Top-Down, Back 3/4), smooth lerp animation via `useFrame`

### Phase 2 — Name on the card (needs blank texture from Blender)

**Requires:** A blank version of the card texture as PNG — same UV layout, but name/personalisation areas left empty (white or transparent). Export from Blender.

- [ ] Load blank PNG as base: `/public/textures/card-blank.png`
- [ ] `useCanvasTexture` hook — offscreen HTML `<canvas>` that composites base PNG + user's typed name at known UV pixel coordinates
- [ ] Text input in a UI panel → updates canvas → `texture.needsUpdate = true`
- [ ] 1-2 font choices loaded via FontFace API (clean sans-serif + script/signature style)
- [ ] Both front and back UV faces handled correctly

**Key decision:** UV pixel coordinates for the name area need to be confirmed from Blender. Even a screenshot with the name zone marked is enough to start.

### Phase 3 — Full Customisation Panel (design investment)

- [ ] Proper designed UI sidebar/drawer (not DialKit) for end-user customisation
- [ ] Gradient card color (canvas gradient layer composited over blank texture)
- [ ] Custom scene backdrop — solid color or gradient sky
- [ ] Environment preset switcher (studio, city, sunset, etc.)
- [ ] Social-ready export — fixed 1:1 or 16:9 crop with optional watermark
- [ ] "Preview modes" — toggle accent lights, switch between clean/dramatic looks

---

## Technical notes

### Card material
- One mesh, `MeshStandardMaterial`
- `material.color` multiplies over the texture map — changing it tints the whole card
- `envMapIntensity` set to 1.4 for reflectivity
- Emissive channel used for the "active glow" effect

### Canvas texture compositing (Phase 2)
```
offscreen canvas
  └── drawImage(blankTexturePNG)       ← base card design
  └── fillText(userName, x, y)         ← name at UV-correct pixel coords
  └── fillText(signatureText, x2, y2)  ← secondary line if needed

THREE.CanvasTexture(canvas) → material.map
texture.needsUpdate = true on every text change
```

### Screenshot / download
Needs `preserveDrawingBuffer: true` on `<Canvas gl={{ preserveDrawingBuffer: true }}>`. Without this, the WebGL buffer is cleared after each frame and `toDataURL` returns blank.

### Camera preset animation
Store presets as `{ position: [x,y,z], target: [x,y,z] }`. On select, lerp `camera.position` and `controls.target` each frame until close enough, then snap. Use a ref flag `isAnimating` to drive this in `useFrame`.

---

## Open questions

1. **Blank texture** — need this exported from Blender before Phase 2 can start
2. **Name UV position** — where on the texture canvas does the name go? (pixel coordinates or % of texture size)
3. **Phase 3 UI design** — what should the customisation panel look like? Bottom drawer, side panel, floating card?
