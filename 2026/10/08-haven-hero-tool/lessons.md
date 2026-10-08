# Lessons: Haven hero tool (Toolcraft)

## What this is
A standalone app generated with `npx @pixel-point/toolcraft create`, used as a tuning playground for the Haven hero background. The drawing lives in `src/app/haven-field.ts`, which is the same file as `08-haven-site/src/lib/havenField.ts`.

## How Toolcraft apps are wired
- `src/app/app-schema.ts` declares the controls with `defineToolcraft`. Each control binds a `target` such as `field.phase` in runtime state, and the runtime renders the panel, history, persistence and export UI.
- `src/app/app-composition.tsx` plugs product code into the runtime's ports through `composeToolcraftApp`:
  - `scene.canvasContent` is the live preview (`haven-canvas.tsx`)
  - `scene.rasterFrameRenderer` draws into the runtime's export context (`haven-export.ts`)
  - `scene.sceneBoundsProvider` gives the artboard rect
  - `renderer.pipelineRegistration` declares the passes (`haven-pipeline.ts`)
- Product code reads values with `useToolcraftValue(target)` and gets the artboard size from `useToolcraftProductSceneFrame()`. The canvas backing must equal CSS size × devicePixelRatio × render scale, or the preview is soft.
- The runtime owns the background. Product output stays a transparent foreground, and the Background switch and colour are merged into Settings automatically.
- The export context is already in scene coordinates: `translate(frame.x, frame.y)` and then draw at `frame.width × frame.height`.

## Gotchas
- Toolcraft's tests enforce a whole delivery contract: an acceptance row for each control, a performance envelope, product readiness data and a worklog. A working visual still fails `vitest` until all of that is written.
- Install reports npm vulnerabilities (2 critical, 1 moderate) in the generated app.
- Don't edit `src/toolcraft/**`. It's signed runtime code.

## Commands
- `npm run dev` serves on a free port (3002 here).
- `npx tsc -p tsconfig.json --noEmit` for types.
