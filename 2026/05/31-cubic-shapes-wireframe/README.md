# 31 — Cubic Shapes & Wireframe / Krystal Hero

**Stack:** React + Vite + TypeScript + Tailwind + Three.js (R3F + Drei)
**Concept:** Custom 3D geometry with glass transmission material, inside a hero section layout.

---

## What was built

A security company hero section (Krystal) featuring a rotating glass diamond as the hero visual.
The diamond is a Three.js `OctahedronGeometry` with `MeshTransmissionMaterial` — physically-based glass/crystal.

---

## Mental model: Vanilla Three.js → React Three Fiber (R3F)

| Vanilla JS | R3F |
|---|---|
| `new THREE.WebGLRenderer()` | `<Canvas>` |
| `new THREE.PerspectiveCamera(fov, aspect, near, far)` | `<Canvas camera={{ fov, position }}>` |
| `new THREE.Scene()` | implicit — Canvas creates it |
| `new THREE.Mesh(geometry, material)` | `<mesh><geometry /><material /></mesh>` |
| `scene.add(mesh)` | just render inside `<Canvas>` |
| `requestAnimationFrame(animate)` | `useFrame((state, delta) => {})` |
| `renderer.render(scene, camera)` | handled automatically by R3F |

**Key insight:** R3F maps every Three.js class to a JSX element by camelCase conversion.
`THREE.OctahedronGeometry` → `<octahedronGeometry />`.
`args={[1.5, 0]}` = constructor arguments in order.

---

## How to think about custom 3D shapes

### 1. Start with built-in geometry

Three.js ships with ~20 geometries out of the box. Reach for these first:

```tsx
<boxGeometry args={[w, h, d]} />
<sphereGeometry args={[radius, widthSegs, heightSegs]} />
<octahedronGeometry args={[radius, detail]} />   // diamond
<icosahedronGeometry args={[radius, detail]} />  // 20-face gem
<dodecahedronGeometry args={[radius, detail]} /> // 12 pentagon orb
<torusGeometry args={[radius, tube, radialSegs, tubularSegs]} />
<torusKnotGeometry args={[radius, tube, tubularSegs, radialSegs, p, q]} />
// p/q = winding: (2,3)=loop, (3,2)=trefoil, (5,3)=star
```

**`detail` parameter** on polyhedra: `0` = sharp original faces, `1+` = subdivided (rounder).
Try `<octahedronGeometry args={[1.5, 1]} />` to see the diamond smooth out.

### 2. PolyhedronGeometry — define any shape with vertices + faces

The lowest-level tool. Define your shape as a list of vertices and triangular face indices:

```tsx
// Vertices: flat array of [x, y, z, x, y, z, ...]
const vertices = [
   1,  1,  0,   -1,  1,  0,   1, -1,  0,  // ...
];

// Indices: flat array of triangle face vertex indices [a, b, c, a, b, c, ...]
const indices = [
  0, 4, 8,   1, 8, 5,   // triangular faces
  0, 4, 2,   0, 2, 6,   // square faces split into triangles
  // ...
];

<polyhedronGeometry args={[vertices, indices, radius, detail]} />
```

**Rules:**
- Every face must be a triangle (quads = split into 2 triangles)
- Winding order matters for normals — use `side={THREE.DoubleSide}` while prototyping
- `detail > 0` subdivides and projects each face outward to a sphere radius
- A cuboctahedron (12 vertices, 14 faces) was implemented this way in this project

### 3. ExtrudeGeometry — 2D shape → 3D

How logos and flat symbols become 3D objects:

```tsx
import * as THREE from "three";

const shape = new THREE.Shape();
shape.moveTo(0, 1);    // draw a 2D outline with moveTo/lineTo/bezierCurveTo
shape.lineTo(0.5, 0);
shape.lineTo(0, -1);
shape.lineTo(-0.5, 0);
shape.closePath();

const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelSize: 0.05 };

// In JSX — pass pre-created geometry via the geometry prop:
const geo = useMemo(() => new THREE.ExtrudeGeometry(shape, extrudeSettings), []);
<mesh geometry={geo}><meshStandardMaterial /></mesh>
```

**This is how you turn an SVG path into a 3D object.** Parse SVG path `d` attribute → `THREE.Shape` → `ExtrudeGeometry`.

### 4. LatheGeometry — spin a profile around the Y axis

Great for vases, crystals, bullets, columns:

```tsx
const points = [
  new THREE.Vector2(0, 0),     // bottom center
  new THREE.Vector2(0.5, 0.5), // wide part
  new THREE.Vector2(0.2, 1.5), // narrow top
];
<latheGeometry args={[points, 32]} />
// args: [points, segments, phiStart, phiLength]
// phiLength < Math.PI * 2 = partial rotation (half vase, etc.)
```

### 5. EdgesGeometry vs wireframe: true

`wireframe: true` on a material draws ALL triangle edges including internal diagonals on quads — looks noisy.
`EdgesGeometry` traces only the real boundary edges of the shape — clean outlines:

```tsx
const geo = useMemo(() => new THREE.OctahedronGeometry(1.5, 0), []);
const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

<mesh geometry={geo}>
  <meshStandardMaterial color="#888" />
</mesh>
<lineSegments geometry={edges}>
  <lineBasicMaterial color="#fff" />
</lineSegments>
```

---

## Materials

| Material | When to use | Key props |
|---|---|---|
| `meshBasicMaterial` | No lighting, flat color | `color`, `wireframe` |
| `meshNormalMaterial` | Debug normals, holographic | — |
| `meshStandardMaterial` | PBR — the workhorse | `color`, `metalness`, `roughness` |
| `meshPhysicalMaterial` | Advanced PBR | adds `transmission`, `ior`, `thickness` |
| `MeshTransmissionMaterial` | Glass/crystal (drei) | `transmission`, `ior`, `chromaticAberration` |

**Chrome:** `metalness={1} roughness={0}` + `<Environment />`
**Glass:** `MeshTransmissionMaterial` with `transmission={1} ior={1.5}` + `<Environment />`
**Diamond:** same as glass but `ior={2.4}` (actual diamond IOR)
**Frosted:** `roughness={0.4}` dulls the reflections and refractions

### MeshTransmissionMaterial props

```tsx
<MeshTransmissionMaterial
  transmission={1}          // 0 = opaque, 1 = fully see-through
  thickness={2}             // how much light bends inside — higher = more distortion
  roughness={0}             // 0 = clear, 1 = frosted/matte
  ior={2.4}                 // index of refraction: water=1.33, glass=1.5, diamond=2.4
  chromaticAberration={0.08}// RGB split at edges — lens prism effect
  color="#c8e8ff"           // tints the glass
  backside                  // render inside faces too — always on for glass
/>
```

---

## Environment maps

Without an environment map, metalness and transmission materials look flat and dead.
`<Environment>` from drei wraps the scene in an HDR image used for lighting and reflections.

```tsx
// Built-in presets (loads from CDN):
<Environment preset="city" />     // urban, cool blue tones
<Environment preset="dawn" />     // warm orange-pink — used here
<Environment preset="studio" />   // neutral, clean product light
<Environment preset="night" />    // dark, subtle stars
<Environment preset="sunset" />   // warm golden hour
<Environment preset="forest" />   // green-tinted ambient

// Your own HDR file — drop in public/:
<Environment files="/your-scene.hdr" />

// Show the environment as background too:
<Environment preset="city" background />
```

Free HDRIs: [polyhaven.com/hdris](https://polyhaven.com/hdris)

---

## useFrame — animation loop

```tsx
useFrame((state, delta) => {
  // state.clock.elapsedTime — total seconds since start
  // delta — seconds since last frame (use this for speed, not elapsedTime)

  mesh.current.rotation.y += delta * 0.3;  // constant speed regardless of FPS

  // Oscillate:
  mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;

  // Breathe (scale pulse):
  const s = 1 + Math.sin(state.clock.elapsedTime) * 0.05;
  mesh.current.scale.setScalar(s);
});
```

Always multiply by `delta` for frame-rate independent motion.

---

## Layout: Cage grid system

This project uses a structural grid aesthetic: thin `border-white/10` lines create vertical columns.

**The rule:** `border-b` lives on the **full-width** outer element so horizontal lines bleed edge-to-edge. `border-l/r` live on the content div (inset by `px-[120px]`) for the vertical cage:

```tsx
// border-b is full viewport width
<div className="border-b border-white/10">
  // max-width constrains content, not the border
  <div className="mx-auto max-w-[1440px] px-[120px]">
    // vertical cage lines, inset 120px from each edge
    <div className="border-l border-r border-white/10">
      {content}
    </div>
  </div>
</div>
```

---

## Run

```bash
npm run dev
```
