# A cube, explained from the outside in

This starter is a small example of a very reusable pattern: **put a component inside another component, then pass it values that describe what you want**. There is no hidden trick to memorise.

```text
App → a full-screen HTML div → Canvas → Scene
                                      ├── lights
                                      ├── mesh = geometry + material
                                      └── camera controls
```

Tap a file below. The first walkthrough covers every part of the actual 26-line `src/App.tsx`.

<details>
<summary>@file: src/App.tsx — explained</summary>

[Open the source](./src/App.tsx).

## What this file does

It creates one white cube, lights it, and lets you move the camera around it. It does not load a model, automatically rotate the cube, or implement scrolling. This Three.js template is different from the SVG agent experiment.

The file has three pieces: two imports, a `Scene` function, and the exported `App` function.

## 1. Imports: borrow two components

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
```

Read the first line as: “From this installed package, give me its named export called Canvas.”

- `import` makes something from another module available in this file.
- `{ Canvas }` is a **named import**. The name must match an export from that package.
- The quoted text is a package name, not a local file path.
- `@react-three` is an npm scope: part of the package's name, not a special JavaScript operator.
- The semicolon ends the statement. It does not affect the animation.

The libraries have different jobs:

| Library | Job |
| --- | --- |
| `three` | The underlying 3D engine |
| `@react-three/fiber` | Lets React describe Three.js objects with JSX |
| `@react-three/drei` | Ready-made helpers, including camera controls |

`Canvas` establishes the 3D rendering environment. `OrbitControls` provides the interaction that lets you orbit, zoom, and pan the camera.

You do not see an `import * as THREE` here because Fiber creates the cube's Three.js objects for us.

## 2. Scene is a function that returns a description

Here is the actual function:

```tsx
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <OrbitControls />
    </>
  );
}
```

`function Scene()` declares a function with no parameters. Its capitalised name lets us use it as a React component: `<Scene />`.

`return (...)` returns the JSX inside the parentheses. The parentheses make a multiline expression easy to read; they do not create another component.

The empty-looking `<> ... </>` is a **fragment**. It groups multiple children without creating an extra HTML element or Three.js object.

That matters because the scene contains siblings: two lights, one mesh, and one controls component. The fragment lets the function return them together.

`Scene` is not exported. `App` can still use it because both functions are in the same file.

## 3. Why some tags are lowercase and some are uppercase

Compare:

```tsx
<mesh />
<Scene />
```

Uppercase names refer to component variables/functions. Lowercase names refer to elements understood by the current renderer.

In an ordinary React DOM tree, `<div>` means an HTML div. Inside Fiber's `Canvas`, `<mesh>`, `<ambientLight>`, and `<boxGeometry>` refer to Three.js objects instead.

**They look like HTML, but they are not HTML elements.** Their meaning comes from the renderer/context they are inside.

This is why `Scene` belongs inside `Canvas`. A plain HTML `<div>` would not replace `<mesh>`, and an ordinary DOM renderer would not turn `<mesh>` into a visible 3D cube.

## 4. Why the geometry and material are nested inside mesh

Think of the mesh as the finished physical object:

```text
mesh
├── geometry: what shape is it?
└── material: what is its surface like?
```

```tsx
<mesh>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="#ffffff" />
</mesh>
```

The geometry describes the box's points and faces. The material describes how that surface looks and responds to light. Fiber attaches them to the mesh's geometry and material properties.

This nesting is **not** “a visible box sitting inside another visible box.” The children supply two ingredients to the same visible object.

Without geometry, the mesh has no supplied shape to draw. Without this supplied material, you would no longer be specifying the intended white, light-responsive surface.

A useful reuse pattern: replace the geometry while keeping the material and parent mesh. You have changed the shape without rebuilding the rest of the scene.

## 5. Decode the brackets one level at a time

```tsx
<boxGeometry args={[1, 1, 1]} />
```

- `args` is a prop: a named input.
- The outer `{ ... }` says “evaluate JavaScript here.”
- The inner `[1, 1, 1]` is a JavaScript array.
- The three array entries are the box's width, height, and depth.

Conceptually, Fiber uses those entries like this Three.js constructor call:

```js
new THREE.BoxGeometry(1, 1, 1);
```

That line is an explanatory equivalent, not a line imported or written in this starter.

The values use **3D world units**, not pixels. The default mesh is centred at the origin. A width of 1 extends roughly half a unit to each side of its centre.

Change the first entry to 2:

```tsx
<boxGeometry args={[2, 1, 1]} />
```

Now the box is twice as wide along the x axis. Its height and depth are unchanged. We changed a constructor input, not the CSS width of the canvas.

Here are three similar-looking but different prop forms:

| Code | Value passed |
| --- | --- |
| `color="#ffffff"` | A string |
| `intensity={0.5}` | A number from a JavaScript expression |
| `position={[5, 5, 5]}` | An array from a JavaScript expression |

A prop is just a way to pass an input into the thing receiving it.

## 6. What the two lights do

```tsx
<ambientLight intensity={0.5} />
<directionalLight position={[5, 5, 5]} intensity={1} />
```

Ambient light adds illumination without one particular direction. The directional light supplies a direction, helping different faces look different instead of making the cube read like a flat white silhouette.

The directional light's position is `[x, y, z]`. In this scene's world coordinates, positive y is upward. Its default target is at the origin, where the cube is centred.

This differs from the SVG experiment, where increasing y goes down the drawing. Always ask which coordinate system you are using.

`intensity` is light strength, **not opacity**. An intensity of 0.5 does not make a light's objects 50% transparent, and intensity is not restricted to a maximum of 1.

The lights are siblings of the mesh, not ingredients inside it. They illuminate suitable materials in the scene. `meshStandardMaterial` responds to those lights.

The template does not enable a shadow setup. Lighting/shading and cast shadows are separate features.

## 7. OrbitControls moves the camera, not the cube

```tsx
<OrbitControls />
```

The trailing `/>` means this element has no JSX children. It does not mean the component does nothing.

The helper uses the camera and input context supplied by `Canvas`. Dragging or using the wheel changes the view. The cube can appear to turn because you are looking at it from a different direction, even though we never changed its rotation.

There is no `useFrame`, timed rotation, GSAP, Motion, or Lenis in this template's `App.tsx`.

This is a useful debugging question: **did the object move, or did the camera move?**

## 8. App puts the scene into a page

```tsx
export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
```

`export default` makes this file's main exported value the `App` component. Another file can then write `import App from "./App"` without curly braces.

The outer `<div>` is ordinary HTML. It establishes the size and dark background of the page area.

`<Canvas>` creates the rendering environment. `<Scene />` is passed into it as a child. When React evaluates `Scene`, its returned lights, mesh, and controls become part of that environment.

This is the “put X inside Y” pattern:

```text
Scene describes WHAT to draw.
Canvas supplies WHERE/HOW to draw it.
App places that canvas in the webpage.
```

There is no need to copy the contents of `Scene` into `App` manually. `<Scene />` composes the existing component into the parent.

## 9. Why camera has double curly braces

```tsx
<Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
  <Scene />
</Canvas>
```

Read the `camera` value in two steps:

1. Outer braces enter a JavaScript expression in JSX.
2. Inner braces create a JavaScript object with `position` and `fov` fields.

The same object could be named first:

```tsx
const cameraSettings = { position: [0, 0, 4] as [number, number, number], fov: 50 };
```

Then passed as `camera={cameraSettings}`. This is an illustrative variation; the starter keeps the object inline. The tuple assertion tells TypeScript the position contains exactly three numbers, rather than an arbitrary-length number array.

The actual camera sits at x=0, y=0, z=4. The cube is at the origin. `OrbitControls` targets the origin by default, so we look back toward the cube.

`fov: 50` is the perspective camera's vertical field of view in degrees, not a pixel measurement. A wider angle shows more of the world; the same cube tends to look smaller. Moving the camera farther away also makes it look smaller.

For a first experiment, change z from 4 to 8 while keeping fov at 50. Expect the cube to look smaller, not to physically shrink. The cube geometry is still 1×1×1 world units.

## 10. className and the md: pattern

```tsx
<div className="w-screen h-screen bg-neutral-950">
```

`className` is React's name for the HTML class attribute. This is one string containing three separate Tailwind utilities:

- `w-screen`: width of the viewport.
- `h-screen`: height of the viewport.
- `bg-neutral-950`: a very dark neutral background.

These classes size/style the HTML wrapper, not the cube's geometry. Giving the wrapper a height matters because the canvas needs an area to fill.

You mentioned `md:`. **The actual starter does not use it.** Here is a separate responsive example:

```tsx
<div className="h-[50vh] md:h-screen">
  <Canvas>
    <Scene />
  </Canvas>
</div>
```

Below Tailwind's default `md` breakpoint, the wrapper is half a viewport high. At `md` and above (48rem by default, commonly 768px), it becomes a full viewport high.

`md:` changes when CSS applies. It does not nest a new element, change a React function, or mean “all tablets.” `h-[50vh]` is Tailwind's arbitrary-value syntax inside a string; those brackets are not a JavaScript array.

## 11. Turn the same cube into a reusable component

This is an optional variation, not code already added to the template:

```tsx
function Cube({ position, color }: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

Then, inside `Scene`, use:

```tsx
<>
  <Cube position={[-1, 0, 0]} color="#00d3c3" />
  <Cube position={[1, 0, 0]} color="#f5ce63" />
</>
```

Keep the existing lights and controls alongside those cubes.

Follow one value:

```text
color="#00d3c3" on Cube
    ↓
Cube receives an object of props
    ↓
{ position, color } extracts the two named values
    ↓
color={color} passes that value into meshStandardMaterial
    ↓
the material uses teal as its base colour
```

The type after `:` describes the expected props. `position: [number, number, number]` is a tuple type: exactly three numeric entries. Types help catch mistakes while developing; they do not paint anything on the screen.

The two instances use the same implementation with different inputs. That is reusable composition, not two separately written cubes.

<details>
<summary>Predict: which change makes the cube taller?</summary>

Changing `args={[1, 1, 1]}` to `args={[1, 2, 1]}` increases the geometry's height along y. Changing the HTML wrapper's `h-screen` affects the available display area instead. They are different layers of the system.

</details>

## 12. What to remember

```text
Canvas = the 3D environment
Scene = a reusable description of its contents
mesh = shape + surface
props = inputs passed to another thing
nesting = how those things are connected
```

You do not need to memorise the exact light coordinates. Learn the pattern: identify the receiver, identify the value being passed, then ask what that receiver does with it.

</details>

<details>
<summary>@file: src/main.tsx — explained</summary>

[Open the source](./src/main.tsx).

This is the bridge from the HTML page into React:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- The curly-brace imports pick named exports.
- `import "./index.css"` has no variable: loading the module for its stylesheet side effect is the purpose.
- `import App from "./App"` receives `App.tsx`'s default export.
- `getElementById("root")` finds the empty mounting element declared in `index.html`.
- The `!` tells TypeScript we expect a non-null element. It does not create one or provide a runtime fallback.
- `createRoot(...)` gives React a place to manage.
- `.render(...)` supplies the component tree for that place.
- `StrictMode` adds development checks, including exercising effect setup and cleanup. It is not a visible wrapper or a second canvas.

Startup is `index.html → main.tsx → App → Canvas → Scene`.

</details>

<details>
<summary>@file: src/index.css — explained</summary>

[Open the source](./src/index.css).

The starter contains:

```css
@import "tailwindcss";
```

This enables Tailwind's stylesheet/build integration. It is why the utility names in `App.tsx`, such as `h-screen`, can generate useful CSS.

The CSS sizes the webpage. Three.js geometry sizes the object. Keeping those two responsibilities separate makes it easier to diagnose whether an issue is layout or 3D composition.

</details>

## Run and check

From the template or a generated experiment:

```bash
npm ci
npm run dev
npm run build
```

Check that the cube is visible, dragging changes the camera view, wheel input zooms, and resizing the page resizes the rendering area. Do not add a scroll controller to this canvas blindly: `OrbitControls` already uses wheel input for zoom.

The lessons describe the starter as it exists now. When you replace the cube with a new experiment, update the walkthrough before the next requested commit.
