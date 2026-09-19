# Lessons Learned: SVG Animation

A beginner-friendly guide to the four-agent scroll animation, and how it relates to the original animated SVG box.

Start with sections 1–4. You do not need to understand the parser, React hooks, or the maths to begin experimenting. The later sections explain those details when you are ready. Keep this guide in sync if the animation changes.

## 1. The simplest explanation

**The original box animation runs on time. This animation runs on scrolling.**

Both move groups of SVG shapes. The difference is what tells those shapes where to go.

There are four things to remember:

| File | Plain-English job |
| --- | --- |
| `src/assets/scene.svg` | The card drawing |
| `src/scene-motion.ts` | Decides how far things should move |
| `src/App.tsx` | Displays the drawing and applies those movements |
| `src/index.css` | The background, font, sizing, and sticky layout |

So, is the animation written in `App.tsx`? **Partly.** The animation instructions are split between two files: `scene-motion.ts` calculates the values, and `App.tsx` puts them onto the actual elements in the browser.

React is not doing the animation automatically. There is no GSAP or Motion dependency. This implementation uses JavaScript, native SVG attributes, and CSS.

## 2. Compare it with the original SVG box

The original sample placed an instruction like this inside an SVG group:

```xml
<animateTransform
  attributeName="transform"
  type="translate"
  values="0,0;0,0;0,-100;0,-100;0,0"
  dur="4s"
  repeatCount="indefinite"
/>
```

This is SVG's built-in animation system, called **SMIL**.

In plain English, it says:

1. Start at the original position.
2. Hold there.
3. Move up 100 SVG units.
4. Hold there.
5. Move back.
6. Repeat over a four-second cycle.

The original sample also used `calcMode="spline"` and `keySplines` to control how the movements accelerate and slow down.

Because the instruction lives inside a `<g>`, it moves all the shapes in that group together. The original cards rose by different amounts, while the lid rose much farther. Drawing the front of the box after the inner cards made the front cover them without a mask.

In this project, JavaScript changes the group's position instead:

```xml
<g transform="translate(0 -120)">
</g>
```

That means: move the group 0 units horizontally and 120 units upward.

| Original box | Four-agent scene |
| --- | --- |
| Time controls progress | Scrolling controls progress |
| Instructions are inside the SVG | Instructions are in TypeScript |
| Automatically repeats | Stays at the current scroll-derived pose |
| Browser calculates intermediate positions | Our motion function calculates them |
| Groups declare their own movement | One shared timeline coordinates the cards, headings, and labels |

The underlying idea is the same: **change a group's position, rather than redraw every shape.**

## 3. Start learning with the rows of numbers

Open `src/scene-motion.ts` and find:

```ts
const positions = [
  [0, 0, 0, 0],
  [-120, 0, 0, 0],
  [-450, -120, 0, 0],
  [-450, -450, 0, 0],
  [-450, -450, -450, 0],
  [-450, -450, -450, -450],
];
```

Each row is one important pose in the animation. Each column always refers to the same card:

```text
[Scheduling, Onboarding, Retention, Payroll]
```

For example:

```ts
[-120, 0, 0, 0]
```

means:

```text
Scheduling: move up 120
Onboarding: do not move
Retention:  do not move
Payroll:    do not move
```

These numbers are offsets from the original illustration, not absolute positions.

- `0` means stay where the card was drawn.
- A negative number moves it upward.
- A positive number moves it downward.

The numbers are **SVG units**, not necessarily screen pixels. The SVG scales with the layout.

The sequence is:

| Scroll progress | Card positions | What is happening |
| --- | --- | --- |
| 0% | `[0, 0, 0, 0]` | Original lower stack |
| 20% | `[-120, 0, 0, 0]` | Scheduling lifts |
| 40% | `[-450, -120, 0, 0]` | Scheduling is high; Onboarding lifts |
| 60% | `[-450, -450, 0, 0]` | First two cards collect above; Retention is exposed |
| 80% | `[-450, -450, -450, 0]` | First three collect above; Payroll is exposed |
| 100% | `[-450, -450, -450, -450]` | All four reunite in the upper stack |

At the end, every card has the same offset, so their original spacing is preserved.

**First exercise:** change the first `-120` to `-200`. Scroll to Scheduling and see it lift farther. Then restore the number before trying something else.

## 4. The line that actually moves a card

In `App.tsx`:

```tsx
card.setAttribute("transform", `translate(0 ${frame.cards[index]})`);
```

Read it as:

> Set this card's position to the number the motion function calculated.

The unfamiliar parts mean:

- `card`: the SVG group we want to move.
- `setAttribute`: change a setting on that element.
- `transform`: the setting that moves the group.
- `translate`: move without changing the shape.
- `frame.cards[index]`: the current movement value for this particular card.

If that value is `-120`, the resulting attribute is:

```xml
transform="translate(0 -120)"
```

You do not need to understand every line in `App.tsx` to change the movement. The `positions` array is the easiest starting point.

## 5. File map and startup sequence

| File | What it does |
| --- | --- |
| `index.html` | The page shell, browser-tab title, and empty `root` element |
| `src/main.tsx` | Loads the CSS and mounts React's `App` inside `root` |
| `src/App.tsx` | Parses the artwork, renders the scene, measures scrolling, and updates elements |
| `src/scene-motion.ts` | Agent names, key poses, easing, heading movement, and callout timing |
| `src/index.css` | Inria Serif, colours, two-column layout, sticky section, mobile layout, and reduced motion |
| `src/assets/scene.svg` | The original four-card artwork |
| `src/assets/callouts.svg` | The separate outlined labels and leader lines |
| `src/vite-env.d.ts` | Vite-specific TypeScript declarations, including asset-import support |
| `package.json` | Dependencies and commands |
| `package-lock.json` | Resolved dependency versions for reproducible installation |
| `vite.config.ts` | React/Tailwind build plugins and the `@` source alias |
| `tsconfig.json` | TypeScript checking and import-resolution options |
| `dist/` | Generated production site; do not edit or commit it |

The startup sequence is:

```text
index.html → main.tsx → App.tsx
                       ├── SVG artwork
                       ├── scene-motion.ts
                       └── DOM elements that the animation updates
```

The temporary `/tmp/project365-*.mjs` files used during development were browser tests and debugging tools. They are not application code and are not required to run the experiment.

## 6. Reading the SVG as code instead of displaying an image

At the top of `App.tsx`:

```tsx
import sceneSource from "./assets/scene.svg?raw";
```

Vite's `?raw` means: give us the SVG file's contents as a string.

If we only displayed the SVG with an `<img>`, we could move the whole image, but could not directly select its individual internal cards from the page.

Instead, `readPaths()` uses the browser's `DOMParser` to read the SVG markup and extract its paths. React then renders those paths inline in the page's own `<svg>`.

Useful SVG vocabulary:

| Attribute/element | Meaning |
| --- | --- |
| `<path>` | A shape described by drawing commands |
| `d` | The path's geometry: move, line, curve, close, etc. |
| `fill` | Interior colour |
| `stroke` | Outline colour |
| `stroke-width` | Outline thickness |
| `<g>` | A group of shapes that can be moved together |
| `viewBox` | The SVG's internal coordinate window |

SVG attributes such as `fill-rule` and `stroke-width` become `fillRule` and `strokeWidth` in React.

### How the cards are separated

This export contains 132 paths, arranged as four cards of 33 paths each. It does not contain named card groups.

The parser recognises each card's beginning using the white top-face path whose `d` starts with `M0.699585`. It collects the following paths until the next card begins, then renders each collection in a `<g>`.

**This is specific to this export.** It is not a general algorithm that understands any illustration. Re-exporting with a different path order, different coordinates, or differently formatted colours can break this detection.

For a future version, explicit named card groups would be more robust. Check the actual export: Figma layer names do not always survive as SVG IDs, depending on export settings and optimisation.

### Layering

Later SVG elements are painted over earlier ones. We preserve the card drawing order so the stack looks correct. The callouts are drawn before the cards, allowing the card faces to cover their line endpoints.

This is the same painter's-order principle used by the front of the original SVG box.

## 7. One coordinate system for cards and callouts

The card export uses `viewBox="0 0 413 981"`. The callout export uses `viewBox="0 0 421 980"`.

Rather than scale those two images independently, the app renders their paths together in:

```xml
viewBox="-2 0 426 1000"
```

This keeps both sets of paths on the same coordinate grid, with a little room around the edges.

It also means a card offset of `-120` and a callout offset of `-120` move by the same visual distance.

Keep the exports' original coordinates when replacing artwork. Cropping and independently recentering each export would require recalculating alignment.

## 8. How the scene stays on screen while scrolling

The layout has two layers:

```text
.scroll-story — a tall outer section
└── .scene    — a one-screen-high sticky scene
```

The important CSS is:

```css
.scroll-story {
  height: 650svh;
}

.scene {
  position: sticky;
  top: 0;
  height: 100svh;
}
```

`100svh` means one small-viewport height. On mobile, it provides a stable reference size when browser controls appear or disappear.

The tall section provides scrolling distance while the inner scene stays at the top. The page is really scrolling; we do not intercept the wheel or replace native scrolling.

The usable distance is:

```text
650svh outer height − 100svh scene height = 550svh
```

A bigger outer height makes the same animation take more scrolling. A smaller height compresses it.

**Second exercise:** change `650svh` to `850svh`. The poses remain the same, but there is more scrolling between them. Restore it afterwards.

## 9. Turning scrolling into progress

`App.tsx` measures the section and calculates:

```ts
progress = clamp((window.scrollY - start) / distance);
```

- `window.scrollY`: how far down the page the browser has scrolled.
- `start`: where this section begins in the document.
- `distance`: the usable animation distance.
- `clamp()`: keeps the result between `0` and `1`.

```text
0   → beginning
0.5 → halfway through the scrolling distance
1   → end
```

This value is passed into:

```ts
getSceneFrame(progress)
```

The function returns the positions and visibility values for the whole scene at that point.

**Important:** the variable named `time` in `scene-motion.ts` is a timeline coordinate derived from scrolling. It is not elapsed seconds. Its range is 0–5 because there are six key poses and five transitions.

## 10. How movement happens between poses

We specify important poses, not every possible position. The code fills the gaps using interpolation:

```ts
position = start + (end - start) * blend;
```

For a card moving from `0` to `-120`:

| Blend | Position |
| --- | --- |
| 0 | 0 |
| 0.5 | -60 |
| 1 | -120 |

The `ease()` function shapes the blend so movement starts and ends gently. It uses a smooth polynomial curve, often called smootherstep. This is not a physics simulation or spring.

```ts
const blend = ease(0.18, 0.82, time - stage);
```

Within each transition, the first 18% holds the previous pose, the middle portion moves, and the last 18% holds the next pose. These pauses give each stage breathing room without snapping the scroll position.

### A worked example

At 30% overall progress:

1. The timeline coordinate is `0.3 × 5 = 1.5`.
2. We are halfway between Scheduling's pose and Onboarding's pose.
3. The eased blend is `0.5`.
4. Scheduling is halfway from `-120` to `-450`, which is `-285`.
5. Onboarding is halfway from `0` to `-120`, which is `-60`.
6. Retention and Payroll remain at `0`.

The result is `[-285, -60, 0, 0]`.

## 11. What animates each element

### Cards

We change the `transform` on each card's `<g>`. All its shapes move together. No path geometry is morphed.

### Main headings

All six heading spans exist in the same position. During a transition:

- The outgoing heading moves upward and fades out.
- The incoming heading rises from below and fades in.

The heading movement uses `transform` and `opacity`. Its travel is currently 28 CSS pixels.

These headings are real HTML text. They use Inria Serif, installed through `@fontsource/inria-serif` and bundled locally rather than fetched from a font service at runtime.

### Leader lines: the trim-path effect

Each callout line is configured with:

```tsx
pathLength={1}
strokeDasharray={1}
strokeDashoffset={1}
```

`pathLength={1}` normalises the length used for dashing, so we can work with 0–1 rather than measure the line's exact length.

| Dash offset | Appearance |
| --- | --- |
| 1 | Hidden |
| 0.5 | Partly drawn |
| 0 | Fully drawn |

The code applies:

```ts
strokeDashoffset = 1 - lineProgress;
```

This reveals the existing stroke; it does not extend the line's geometry. Its path direction starts at the card, so the line draws upward toward the label. Reversing the progress retracts it.

### Callout lettering

The callout words are outlined SVG paths, not editable text elements. We preserve the exact lettering and move/fade each whole label:

- Slight upward entrance and fade-in as the leader line finishes drawing.
- A visible hold during the feature stage.
- Upward fade-out as that stage ends.

This is not handwriting or a letter-by-letter animation.

Changing `agents[index].label` changes the accessible/static summary, not the lettering inside `callouts.svg`. To change the visible lettering, replace its SVG paths or intentionally convert the label into a text element.

### Callout timing

The line and label each have an entrance window and an exit window:

```ts
visibility = entrance * (1 - exit);
```

Before entrance, visibility is 0. During the feature stage, it reaches 1. After exit, it returns to 0. Only the current agent's callout is shown, and the initial and final states have no callouts.

These windows are scroll-timeline values, not durations in seconds.

### Keeping lines attached

The callout group also receives a vertical transform. Its alignment uses the card's original top, the current card movement, and the 30-degree isometric edge:

```ts
y = agent.top + (274 - 206.088) / Math.sqrt(3) + cards[index] - agent.lineStart;
```

Read this as: find the card edge at the line's horizontal position, then shift the original line endpoint to meet it.

The numbers come from this artwork, so they may need updating if the illustration changes.

## 12. Why backward scrolling works

There is no instruction saying, "Scheduling has finished; start Onboarding."

Instead, we always ask:

> At this exact scroll position, where should everything be?

The same progress gives the same result. Scrolling backward simply asks for earlier positions. There are no separate reverse animations to synchronise.

`getSceneFrame()` is a pure calculation: it does not read the DOM, start timers, or remember the previous stage. That also makes it easy to test without opening a browser.

## 13. What React and requestAnimationFrame do

React creates the elements. The DOM is the browser's live tree of those elements.

- `useRef()` keeps references to the actual section and scene elements.
- `useLayoutEffect()` sets up the animation after React creates those elements.
- Scroll events request an update.
- `requestAnimationFrame()` schedules that update before a browser paint.

```ts
if (!request) request = window.requestAnimationFrame(render);
```

If several scroll events arrive before the next frame, they share one pending update. The render function then uses the latest scroll position.

This is not a continuously running loop. When scrolling and resizing stop, the scene stays still.

We directly update the animation attributes rather than use a React state setter on every scroll event. That avoids rerendering all 132 card paths just to move four groups.

`ResizeObserver` and resize events refresh measurements when the layout changes. The effect's cleanup removes listeners, disconnects the observer, and cancels pending work. Cleanup also matters because development Strict Mode intentionally exercises effect setup and cleanup.

## 14. Mobile and accessibility

Below 640px, CSS changes the desktop two-column layout into a heading area above the illustration.

When the operating system requests reduced motion:

- The tall scroll track becomes one viewport high.
- Cards stay in the original stack.
- Animated callouts are hidden.
- A static list names all four agents and their roles.

The illustration is decorative to screen readers. A real heading and the static summary communicate its meaning without requiring someone to interpret moving vector lettering.

A keyboard-focusable "Skip animation" link also lets users jump to the end.

## 15. The reload bug and why the empty root has a height

The production browser test found that reloading halfway through the sequence could return to the top.

The browser tried restoring the previous scroll position before React had mounted the tall scene. At that moment, the document was too short to scroll to the saved position.

This CSS reserves the space before mounting:

```css
#root:empty,
.scroll-story {
  height: 650svh;
}
```

Once React mounts, the real section replaces the reserved space. Reduced-motion styles reserve only one viewport.

Lesson: a passing build is not enough. A production browser check can reveal timing problems that are less obvious in development.

## 16. TypeScript and deployment lessons

### The baseUrl warning

The editor reported that TypeScript's `baseUrl` option was deprecated. Rather than suppress the warning, we removed it and made the alias path explicitly relative:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

Vite keeps its corresponding alias configuration. TypeScript checking and the production build passed after the change.

### GitHub Pages subpaths

The published experiment lives below `/project-365/2026/09/19-svg-animation/`, not at the domain root.

The existing GitHub Actions workflow builds experiments with the appropriate Vite base path. Imported SVG strings and bundled font assets work with that setup. Future runtime references to `public/` assets must use `import.meta.env.BASE_URL`, rather than a bare root path such as `/image.svg`.

`catalog.json` at the repository root controls the gallery listing. A successful code push, a successful deployment, and a gallery entry are three separate things to check.

Do not commit `node_modules/`, `dist/`, or TypeScript's generated `*.tsbuildinfo` cache.

## 17. Run and verify

From this experiment's directory:

```bash
npm ci
npm run dev
```

Check types and make a production build:

```bash
npm run build
```

Check the actual deployment base path:

```bash
npm run build -- --base=/project-365/2026/09/19-svg-animation/
npm run preview -- --base=/project-365/2026/09/19-svg-animation/
```

Open the URL printed by Vite. Stop the development or preview server with Ctrl+C when finished.

Browser verification should cover:

- All six poses and the transitions between them.
- Only the active callout appearing, with no callouts at the endpoints.
- Partial line drawing, not just fully visible/hidden states.
- Reverse scrolling restoring the same positions.
- Reloading in the middle of the section.
- Font loading and no horizontal overflow.
- Narrow/mobile layouts and reduced motion.
- No JavaScript errors or failed application asset requests.

## 18. A practical editing guide

| Change you want | Where to edit |
| --- | --- |
| Lift a card farther | `positions` in `scene-motion.ts` |
| Require more/less scrolling | `650svh` in `index.css` |
| Hold poses longer/shorter | The `0.18` and `0.82` transition boundaries |
| Change main heading wording | `headings` and agent `title` values |
| Change heading travel | The `28` values |
| Change when a line draws/retracts | The callout `line` expression |
| Change label entrance/exit | `text` and `textY` |
| Change the visible callout words | Lettering paths in `callouts.svg` |
| Change colours, divider, sizing | `index.css` |
| Change card artwork | `scene.svg`, checking the grouping assumptions afterwards |

Try one small change at a time, observe it, then restore it or deliberately keep it. Do not start by changing every timing value together.

Suggested learning order:

1. Change one card offset.
2. Change the scroll distance.
3. Change one heading.
4. Change the heading's movement distance.
5. Adjust a callout's reveal window.
6. Only then study the parser and lifecycle code.

## Final mental model

```text
Artwork supplies the shapes.
CSS supplies the stage.
Scrolling supplies progress.
scene-motion.ts supplies movement values.
App.tsx applies those values to the page.
```

The core concept is not complicated: **scrolling changes numbers, and those numbers move the drawing.**
