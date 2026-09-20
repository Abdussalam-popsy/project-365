# One card, one line, one scroll

A guided tour of the SVG experiment. Follow **Scheduling** from a drawing to a moving card, instead of trying to memorise the whole app.

**Three answers before we start:**

- **Did we use groups like your original? Yes.** We create `<g>` elements in React.
- **Did we use GSAP or Motion? Neither.** Native JavaScript calculates the movement; SVG displays it; CSS keeps the scene pinned.
- **Is the animation in `App.tsx`? Partly.** `scene-motion.ts` decides the numbers. `App.tsx` applies them.

Read the short story below. **Tap the expandable sections only when you want the syntax or maths.** They work in GitHub's rendered Markdown, including on a phone.

[The running scroll experiment](https://abdussalam-popsy.github.io/project-365/2026/09/19-svg-animation/) · [Your original timed box, as a runnable SVG](./timed-box.svg)

---

## 1. We did not cut your cards into columns

There are two different jobs here:

```text
GROUPING: Which shapes belong to this card?
MOVEMENT: How far should this card move?
```

Your original box already had groups. Both Figma card exports arrived as long lists of paths without card-level groups.

The first implementation guessed the boundaries from a coordinate. With the updated icons, we now give each card an explicit name in [scene-updated.svg](./src/assets/scene-updated.svg):

```text
52 paths → <g id="payroll">
42 paths → <g id="retention">
24 paths → <g id="onboarding">
33 paths → <g id="scheduling">
```

A group is just a container. Move the container, and its white face, blue sides, icon, and lettering move together. The groups do not need equal numbers of paths.

The browser ultimately gets a group tagged like this:

```xml
<g class="agent-card" data-card="scheduling">
</g>
```

The real group contains Scheduling's 33 paths; the empty example above only shows its wrapper.

**Same idea as your `<g>`.** The source SVG now names the groups explicitly. [App.tsx](./src/App.tsx) reads those named groups and creates their animated counterparts on the page.

<details>
<summary>Show me exactly how the code finds the four cards</summary>

This is the current code in `App.tsx`:

```ts
const sceneDocument = readSvg(sceneSource);
const cardLayers = [...agents].reverse().map(({ id }) => {
  const group = sceneDocument.getElementById(id);
  if (!group) throw new Error(`Missing SVG card group: ${id}`);
  return readPaths(group);
});
```

Read it as:

1. Parse the SVG markup into a document.
2. Visit the agent names in back-to-front drawing order.
3. Find the group with that name, such as `id="payroll"`.
4. Read the paths inside that group.

| Syntax               | Meaning here                                         |
| -------------------- | ---------------------------------------------------- |
| `[...agents]`        | Make a copy of the agent list                        |
| `.reverse()`         | Reverse that copy without changing the original list |
| `.map(...)`          | Produce one path collection per agent                |
| `({ id })`           | Take the `id` field from the current agent           |
| `getElementById(id)` | Find the source SVG element with that exact ID       |
| `if (!group)`        | If that group is missing                             |
| `readPaths(group)`   | Extract the path attributes inside that group        |

There is no fixed path count and no geometry-prefix guessing now. You can add detail to an icon inside its existing group without changing which card it belongs to.

The groups must contain the actual path coordinates, as this export does. The parser is not a general SVG renderer: it does not preserve arbitrary nested transforms, masks, or other element types. If a future export introduces those, inspect it before replacing this file.

</details>

<details>
<summary>What happened to the coordinate detector from the first lesson?</summary>

The original [scene.svg](./src/assets/scene.svg) is kept for comparison. It contained four cards of 33 paths each, with no named groups.

The old code started a new collection whenever it found a white top face beginning with `M0.699585`, then appended the following paths until the next top face. `.reduce(...)` collected those paths into four arrays.

It did not cut the SVG every 33 paths. That happened to be each card's count.

When the updated icon artwork was exported, Figma changed that starting coordinate to `M0.699707`. Visually the card barely moved, but an exact string comparison would fail.

Instead of changing one fragile decimal check to another, we added the four named `<g>` wrappers without changing any path geometry. The app now reads names, not decimal prefixes.

**The lesson:** give moving objects an identity rather than recognise them by an incidental coordinate. Preserve these group IDs on future exports, or add the wrappers back after exporting. Figma layer names do not always survive as SVG IDs.

</details>

<details>
<summary>How does an array of paths become an actual SVG group?</summary>

This is the rendering code in `App.tsx`:

```tsx
<svg>
  {cardLayers.map((paths, index) => (
    <g
      className="agent-card"
      data-card={agents[agents.length - 1 - index].id}
      key={index}
    >
      {paths.map((path, pathIndex) => (
        <path
          {...path}
          fill={cardPaint(path.fill)}
          stroke={cardPaint(path.stroke)}
          key={pathIndex}
        />
      ))}
    </g>
  ))}
</svg>
```

- `.map(...)`: make one rendered item for each item in the array.
- `(paths, index) => ...`: a small function receiving this card's paths and its position in the list.
- `{...path}`: put the saved attributes, such as `d`, `fill`, and `stroke`, on the new path element.
- `className`: React's spelling of HTML/SVG `class`.
- `data-card`: a label we attach so JavaScript can find a particular card later. It does not animate anything by itself.
- `key`: helps React identify list items; it is not an SVG movement setting.

We collect the named groups in Payroll → Retention → Onboarding → Scheduling order, regardless of where they appear in the export. The `agents` array is Scheduling → Onboarding → Retention → Payroll.

So `agents.length - 1 - index`, or `3 - index`, reverses the name lookup. The first rendered group gets Payroll's name; the last gets Scheduling's.

We keep the rendering order because SVG draws later shapes over earlier shapes. Scheduling must sit on top when the cards overlap. This is the same reason your original box drew its front after the inner cards.

</details>

## 2. Now give each card a seat in the movement list

The four **columns** you noticed are just four array entries:

```text
column/index       0           1          2         3
card          Scheduling  Onboarding  Retention  Payroll
movement         -120         0          0         0
```

JavaScript counts from zero. So `cards[0]` means Scheduling's movement.

```ts
[-120, 0, 0, 0];
```

means **move Scheduling up 120; leave the other three where they were drawn**.

It does not mean four CSS columns or four slices of the image. The page's left/right columns are a separate CSS layout.

> **Remember: a group holds the drawing. An array entry holds its movement number.**

<details>
<summary>Where do all six poses live?</summary>

In [scene-motion.ts](./src/scene-motion.ts):

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

Read down the rows to follow the story:

1. All four are in the original lower stack.
2. Scheduling lifts.
3. Scheduling goes higher; Onboarding lifts.
4. The first two collect above; Retention is exposed.
5. The first three collect above; Payroll is exposed.
6. All four reunite in the upper stack.

`positions[1][0]` means: second pose, first card. Its value is `-120`.

Negative vertical movement goes up. Positive goes down. Zero means no offset from the original drawing.

These are **SVG units**, not necessarily screen pixels. The illustration scales with the page. Its path coordinates do not need to be rewritten for each screen size.

At the end, all offsets equal `-450`, so the original spacing between the cards is preserved.

</details>

**Predict before you edit:** if the second row becomes `[-200, 0, 0, 0]`, which card changes?

<details>
<summary>Reveal the answer</summary>

Only Scheduling. It rises farther in its featured pose. The other entries are still zero. Try it locally, scroll, then restore `-120` before the next experiment.

</details>

---

## 3. Follow Scheduling: your finger scrolls, a number changes

Imagine scrolling down until you are **10% through the animation's scroll distance**.

Here is the chain:

```text
Your scroll
    ↓
App.tsx measures progress: 0.10
    ↓
scene-motion.ts calculates Scheduling: -60
    ↓
App.tsx applies: translate(0 -60)
    ↓
The entire Scheduling group moves up
```

There is no GSAP timeline hidden behind this. The browser tells us that scrolling happened, and our code calculates a new position.

At 20% progress, Scheduling reaches its featured pose at `-120`.

**The SVG is still the same drawing. We changed one setting on its group.**

<details>
<summary>How can you scroll while the scene stays still?</summary>

[The CSS](./src/index.css) creates a tall section containing a sticky scene:

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

`100svh` is one small-viewport height, a stable reference when mobile browser controls appear or disappear.

The outer section provides distance to scroll. The inner scene stays at the top while that distance is used. Native scrolling still works; we are not blocking wheel or touch input.

Usable animation distance:

```text
650svh outer section − 100svh scene = 550svh
```

In `App.tsx`:

```ts
const progress = clamp((window.scrollY - start) / distance);
```

- `scrollY`: where the browser is vertically on the page.
- `start`: the section's starting position in the document.
- `distance`: the usable scrolling distance.
- `clamp`: keep the answer between 0 and 1.

For an easy example, if usable distance were 5,000 pixels and you had travelled 500 pixels into it, progress would be `500 / 5000 = 0.10`.

</details>

<details>
<summary>Where did -60 come from? Walk through the calculation</summary>

At 10% scroll progress:

```ts
time = 0.1 * 5;
```

This gives `0.5`. There are six poses and five transitions. Despite its name, `time` is **not seconds**; it is our position on the scroll timeline.

We are halfway between pose 0 and pose 1. Scheduling's start and end offsets are 0 and -120.

The blend is eased using:

```ts
const blend = ease(0.18, 0.82, time - stage);
```

`stage` is the current transition's starting pose. At this point it is 0. The eased blend at the middle is 0.5.

Then:

```text
position = start + (end − start) × blend
         =     0 + (−120 − 0) × 0.5
         = −60
```

This filling-in-between-poses is called **interpolation**.

The `ease()` function gently starts and ends the motion. It uses a smooth polynomial curve, not a spring simulation. You do not need to memorise the polynomial to adjust the poses.

The `0.18` and `0.82` boundaries leave a short hold at both ends of each transition. There is no scroll snapping.

Another checkpoint: at 30% progress, the result is approximately `[-285, -60, 0, 0]`. Scheduling is travelling higher, Onboarding is rising, and the other cards have not moved.

</details>

<details>
<summary>Decode the exact JavaScript line that moves Scheduling</summary>

`App.tsx` first finds the groups by their tags, in the same order as `agents`:

```tsx
const cards = agents.map(
  (agent) => scene.querySelector<SVGGElement>(`[data-card="${agent.id}"]`)!,
);
```

For Scheduling, the selector becomes `[data-card="scheduling"]`.

- `querySelector(...)`: find the matching element inside the scene.
- `<SVGGElement>`: tells TypeScript we expect an SVG group.
- The final `!`: tells TypeScript we expect a match, not `null`. It does not check that at runtime.

Then it applies the calculated values:

```tsx
cards.forEach((card, index) => {
  card.setAttribute("transform", `translate(0 ${frame.cards[index]})`);
  card.style.setProperty("--card-focus", `${frame.focus[index] * 100}%`);
});
```

Break that down:

| Syntax                 | Plain English                               |
| ---------------------- | ------------------------------------------- |
| `forEach`              | Do this for every card                      |
| `index`                | Which card are we on: 0, 1, 2, or 3?        |
| `frame.cards[index]`   | Its movement value for this scroll position |
| Backticks and `${...}` | Build text with a value inserted into it    |
| `setAttribute`         | Change this element's setting               |
| `transform`            | The setting that moves the group            |
| `translate(0 -60)`     | Move 0 horizontally and -60 vertically      |

For Scheduling, this produces:

```xml
<g class="agent-card" data-card="scheduling" transform="translate(0 -60)">
</g>
```

Again, the real group contains the card's paths. Moving its wrapper moves all of them together.

</details>

<details>
<summary>How does the active card brighten without becoming see-through?</summary>

All cards begin muted. During each agent's stage, its whole card and icon return to their original colours. As the next agent takes over, the previous card mutes again. All cards finish muted.

We do **not** lower the card's opacity. That would reveal the icons and faces underneath it.

Instead, `cardPaint()` maps each original fill and stroke to a named CSS colour variable. For example, `white` becomes `var(--card-face)`. The original SVG artwork stays unchanged.

In `index.css`:

```css
.agent-card {
  --card-face: color-mix(in srgb, #59637b, #fff var(--card-focus, 0%));
}
```

- At `--card-focus: 0%`, the face is solid muted blue-grey.
- At `50%`, it is halfway between that colour and white, still solid.
- At `100%`, the original white is restored.

Both input colours are opaque, and their weights add to 100%. Nothing becomes transparent. The blue sides, dark recess, and outlines have matching colour pairs so the entire illustration changes together.

`scene-motion.ts` uses the same 0–1 blend as each agent's heading to calculate `frame.focus`. It excludes the first and last overview headings, so neither endpoint activates a card. During a handoff, one card dims while the next brightens.

`App.tsx` updates the card group's CSS variable:

```ts
card.style.setProperty("--card-focus", `${frame.focus[index] * 100}%`);
```

`setProperty` changes a CSS custom property. Its children inherit the palette variables, so we update four groups rather than manually recolour every path on every frame.

We reuse the heading's visibility number, **not** its opacity behaviour: text fades, but card colours blend. The active colour values match the source artwork exactly. Reverse scrolling reverses the colour blend too.

To tune how muted the inactive cards look, change the first colour in each `.agent-card` palette pair in `index.css`. Leave the second colour alone to preserve the original active artwork. `fill="none"` remains `none` for paths that were already outline-only.

</details>

## 4. Scheduling's callout: draw first, then speak

Watch this sequence on the live scene:

```text
Card lifts → line draws → YOUR CARERS appears
                 ↓
Text leaves → line retracts → next agent takes over
```

The callout is **two separate paths**:

1. A stroked path for the thin leader line.
2. A filled path containing the outlined letters `YOUR CARERS`.

That lets us draw the line and fade the words independently. We do not fade a single image containing both.

Scheduling's actual line from [callouts.svg](./src/assets/callouts.svg) is:

```xml
<path d="M274 530V435L344 365" stroke="white" />
```

Read those drawing commands as:

```text
M274 530   Move the pen to (274, 530), by the card.
V435       Draw vertically to y = 435.
L344 365   Draw diagonally to (344, 365), near the label.
```

The line already exists. The animation progressively reveals its stroke.

<details>
<summary>How does Scheduling get YOUR CARERS instead of another label?</summary>

`callouts.svg` contains four pairs, each with the lettering first and the leader line second. Like the card export, the pairs are ordered Payroll, Retention, Onboarding, Scheduling.

`App.tsx` selects the right pair with:

```ts
const sourceIndex = (agents.length - 1 - index) * 2;
```

For Scheduling, `index` is 0. There are four agents:

```text
(4 − 1 − 0) × 2 = 6
```

So `calloutPaths[6]` is YOUR CARERS and `calloutPaths[7]` is its line. These are zero-based array indexes, not file line numbers. Multiplying by 2 steps through pairs instead of individual paths.

They are rendered inside a group tagged `data-callout="scheduling"`. The effect finds that group by its tag, then finds `.callout-line` and `.callout-label` inside it.

For each update, `const state = frame.callouts[index]` picks that agent's calculated line progress, opacity, and movement values. The same agent index connects the card, the callout, and their animation values.

This pairing assumes the current export order; it does not recognise the words by reading their outline shapes.

</details>

<details>
<summary>How trim-path works: a line, a dash, and an offset</summary>

The rendered line receives these React properties:

```tsx
<path
  d="M274 530V435L344 365"
  stroke="white"
  fill="none"
  pathLength={1}
  strokeDasharray={1}
  strokeDashoffset={1}
/>
```

Think of a dashed line with **one dash as long as the entire path**, followed by an equally long gap.

- `pathLength={1}` normalises dash distances so the whole path counts as 1.
- `strokeDasharray={1}` creates that one-path-long dash/gap pattern.
- `strokeDashoffset` slides the pattern along the path.

| Offset | What you see             |
| ------ | ------------------------ |
| 1      | The gap: line hidden     |
| 0.5    | Half the stroke revealed |
| 0      | The whole line           |

`App.tsx` does this:

```ts
lines[index].setAttribute("stroke-dashoffset", String(1 - state.line));
```

`state.line` grows from 0 to 1. The dash offset therefore decreases from 1 to 0.

For example, line progress 0.25 gives offset 0.75: roughly the first quarter is visible. The path starts at the card, so drawing proceeds from card to label.

`String(...)` turns a number into text for the SVG attribute. JSX uses `strokeDashoffset`, but `setAttribute` uses SVG's actual name, `stroke-dashoffset`.

**We are not stretching the line or changing `d`. We are revealing an existing stroke.**

</details>

<details>
<summary>Exactly when does Scheduling's line and text appear?</summary>

These are percentages of the section's **usable scroll distance**, not seconds or the whole document.

| Scroll progress | Scheduling's callout              |
| --------------- | --------------------------------- |
| Before 13.2%    | Hidden                            |
| 13.2% → 17.6%   | Line draws                        |
| 16.4% → 20%     | Text rises and fades in           |
| 20% → 24%       | Line and text stay visible        |
| 24% → 26.8%     | Text rises slightly and fades out |
| 26% → 29.6%     | Line retracts                     |
| After 29.6%     | Hidden                            |

There is a deliberate overlap: text starts appearing as the line nears completion, rather than waiting for an unrelated timer.

In `scene-motion.ts`:

```ts
const local = time - (index + 1);
const line = ease(-0.34, -0.12, local) * (1 - ease(0.3, 0.48, local));
const text = ease(-0.18, 0, local) * (1 - ease(0.2, 0.34, local));
```

For Scheduling, `index` is 0, so `local = time - 1`. Its featured pose is at `time = 1`, making `local = 0` there.

Read each expression as:

```text
visibility = entering × (1 − leaving)
```

- Before entering: `0 × 1 = 0`.
- Fully visible: `1 × 1 = 1`.
- After leaving: `1 × 0 = 0`.

The thresholds use the local timeline. For example, line entrance begins when `time - 1 = -0.34`. So `time = 0.66`, and overall progress is `0.66 / 5 = 0.132`, or 13.2%.

Other agents reuse the same relative timing, centred around their own featured poses.

</details>

<details>
<summary>How do the words move? Is it handwriting?</summary>

No. The entire `YOUR CARERS` label is one filled vector path. We fade and translate that whole path; we do not draw its letters one by one.

`scene-motion.ts` calculates:

```ts
textY: 8 * (1 - ease(-0.18, 0, local)) - 5 * ease(0.2, 0.34, local);
```

- Entrance: start 8 SVG units lower, then rise to 0.
- Hold: remain at 0.
- Exit: rise another 5 units while fading away.

`App.tsx` applies:

```ts
labels[index].setAttribute("opacity", String(state.opacity));
labels[index].setAttribute("transform", `translate(0 ${state.textY})`);
```

Opacity 0 is invisible; 1 is fully visible.

At 20% overall progress, Scheduling's label has opacity 1 and `textY = 0`. Its line has dash offset 0, meaning fully drawn.

The main left-hand heading is different: it is real HTML text using locally bundled **Inria Serif**. That heading moves 28 CSS pixels and crossfades with the next heading.

Changing the agent's `label` string only updates the accessible/static summary. The visible outlined words must be changed in `callouts.svg` or deliberately converted into real text.

</details>

<details>
<summary>Why does the line stay attached when the card moves?</summary>

The line and lettering share a callout `<g>`. We move that parent group to keep its lower endpoint on the card. The lettering also gets its own small entrance/exit movement inside the parent.

```text
Callout group: follows the card
├── Line: dash offset changes
└── Words: opacity + small vertical movement change
```

The parent alignment is calculated by:

```ts
y: agent.top + (274 - 206.088) / Math.sqrt(3) + cards[index] - agent.lineStart;
```

For Scheduling at its featured pose:

```text
top of original card                 600
height along the slanted edge        +39.209...
current card movement               -120
original line starting y            -530
                                    ──────────
callout group offset                -10.791...
```

The line's original endpoint at y=530 therefore ends up near y=519.209, meeting the moved card edge at x=274.

The division by `Math.sqrt(3)` comes from the artwork's 30-degree isometric edge. These are coordinates from this drawing, not universal animation constants.

Both source SVGs are rendered into one `viewBox="-2 0 426 1000"`. We do not stretch the 413×981 card export and the 421×980 callout export independently. Shared coordinates keep their movement consistent.

The callouts render before the cards, so a card face can cover the attached end of a line.

</details>

**Quick test:** to make the line reveal earlier, would you edit its `d` drawing commands or its reveal thresholds?

<details>
<summary>Reveal the answer</summary>

The reveal thresholds in `scene-motion.ts`. `d` changes the line's shape. Timing values change when you see it. To move the entrance earlier while preserving its length, move both entrance thresholds earlier by the same amount.

</details>

---

## 5. What actually makes it tick? Not a library

There are three different jobs:

| Job                          | What this project uses        |
| ---------------------------- | ----------------------------- |
| Build the page's elements    | React                         |
| Keep the section on screen   | CSS `position: sticky`        |
| Calculate and apply movement | Our TypeScript + browser APIs |

The update chain is:

```text
scroll event
    ↓
schedule one requestAnimationFrame callback
    ↓
read the latest scroll position
    ↓
getSceneFrame(progress)
    ↓
update transforms, opacity, and dash offsets
```

**`requestAnimationFrame` does not invent the animation.** It asks the browser for a good moment to apply our updates before a paint.

Stop scrolling, and the scene holds its pose. Scroll backward, and the same calculation gives earlier poses. There is no separate reverse animation.

<details>
<summary>The actual event code, without the mystery</summary>

These excerpts live in `App.tsx`:

```ts
window.addEventListener("scroll", schedule, { passive: true });
```

This means: when the page scrolls, call `schedule`. `passive: true` tells the browser this listener will not cancel native scrolling.

```ts
function schedule() {
  if (!request) request = window.requestAnimationFrame(render);
}
```

`!request` means there is not already an update waiting. Several scroll events can share one pending callback. `render()` resets that pending ID and reads the newest scroll position.

The local function named `render()` is our DOM-update function, not a call to React's rendering system.

We change animation attributes directly rather than call a React state setter on every scroll event. React does not need to rebuild all the SVG paths just to move four groups.

</details>

<details>
<summary>Would GSAP or Motion have been another valid choice?</summary>

Yes. Neither is required just because an animation is scroll-linked.

| Approach                | What it would provide                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| Current native approach | We own the scroll calculation and interpolation; no animation dependency |
| GSAP + ScrollTrigger    | Timeline orchestration, scroll-linked scrubbing, and pinning tools       |
| Motion for React        | Scroll-linked motion values and declarative animated elements            |
| SVG SMIL                | Self-contained timed SVG animations like your original box               |

Libraries can reduce manual coordination for more complex timelines. This version uses a small shared calculation because there are only four moving cards and predictable poses.

Trade-off: the native implementation needs its own timing maths, measurements, cleanup, and browser tests. "No library" does not mean "no animation code" or automatically better code.

There are no hidden GSAP or Motion calls in this project. Tailwind is styling tooling, not the driver of the animation.

</details>

## 6. Your original approach is a complete alternative

Your box animation did not need React at all. It used **SMIL**, SVG's built-in animation system.

The full box, all three inner cards, and the lid are saved in **[timed-box.svg](./timed-box.svg)**. Open that file directly in a browser, or paste its contents into the HTML area of Tailwind Play/CodePen.

This companion preserves your original drawing and four-second movements. It explicitly adds `keyTimes` and removes the trailing separator in `keySplines` to make the timing definition clear. It is a standalone learning example, not a replacement for the scroll scene or a file imported into its production build.

<details>
<summary>Try a tiny complete version first: copy, paste, watch</summary>

This uses simple shapes so the animation instruction is easy to spot. The full original-style illustration is in `timed-box.svg`.

Save this as an `.svg` file and open it in a browser, or paste it into a playground's HTML panel. No imports, installation, or JavaScript required.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 220" width="240">
  <g>
    <rect x="40" y="140" width="160" height="50" fill="#94BDFA" />
    <text x="120" y="170" text-anchor="middle" fill="#050b24">One card</text>
    <animateTransform
      attributeName="transform"
      type="translate"
      values="0,0;0,0;0,-100;0,-100;0,0"
      keyTimes="0;0.25;0.5;0.75;1"
      calcMode="spline"
      keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1;0.25 0.1 0.25 1"
      dur="4s"
      repeatCount="indefinite"
    />
  </g>
</svg>
```

Because `animateTransform` is inside the `<g>`, the rectangle and its text move together. Put the instruction on an individual shape instead, and it would animate that element rather than the whole group.

These timed learning examples loop continuously; they do not implement the scroll app's reduced-motion fallback. Add pause/reduced-motion behaviour before using a looping example as a production feature.

</details>

<details>
<summary>Decode every animation attribute in your original method</summary>

| Attribute                   | Meaning                                                |
| --------------------------- | ------------------------------------------------------ |
| `attributeName="transform"` | Animate the group's transform                          |
| `type="translate"`          | Move it, rather than rotate or scale it                |
| `values`                    | The sequence of horizontal/vertical offsets            |
| `keyTimes`                  | When each value is reached, as a fraction of the cycle |
| `dur="4s"`                  | One full cycle takes four seconds                      |
| `repeatCount="indefinite"`  | Repeat the cycle                                       |
| `calcMode="spline"`         | Use easing curves between the values                   |
| `keySplines`                | The cubic Bézier curves for those intervals            |

The full box also retains `attributeType="XML"`, which identifies an SVG/XML attribute as the target. It is not what makes the animation scroll-linked or timed.

Here is one card's cycle:

```text
keyTimes    0      0.25      0.5      0.75      1
seconds     0       1        2         3       4
y offset    0       0      -100      -100      0
            └ hold ┘└ lift ┘└ hold ┘└ return ┘
```

Repeated values create the holds. Five values create four intervals, so there are four easing-curve entries, separated by semicolons. Each `0.25 0.1 0.25 1` gives two control points for one interval's cubic Bézier easing curve; those numbers are not movement coordinates or seconds.

The three cards use maximum lifts of `-100`, `-150`, and `-200`. The lid uses `-800`. They share the same cycle, so they move together but separate by different amounts.

To slow the entire box while keeping it coordinated, change `dur` on **all four** animation elements, not just the lid.

The box's drawing order is: interior → inner cards → front wall → lid. Later paths cover earlier ones, which creates the occlusion as the cards emerge.

</details>

**The comparison worth remembering:**

```text
Original: the clock chooses progress.
New one:  your scroll chooses progress.
Both:     a transform moves a group.
```

We replaced the controller, not the basic idea of moving SVG groups.

---

## 7. Try these three experiments, one at a time

Run `npm run dev` inside this experiment. Restore each change before moving to the next so you can see which setting caused which effect.

| Try this                            | Where                             | What to notice                                |
| ----------------------------------- | --------------------------------- | --------------------------------------------- |
| First `-120` → `-200`               | `positions`, in `scene-motion.ts` | Scheduling rises farther; its callout follows |
| `650svh` → `850svh`                 | `index.css`                       | Same poses, more scroll distance between them |
| `28` → `50` in both heading offsets | `scene-motion.ts`                 | Headings travel farther; cards are unchanged  |

Then try changing **all four** `dur="4s"` values in `timed-box.svg` to `8s`. Notice how that slows the box without adding any scrolling code.

**You do not have to memorise the implementation. Learn which knob changes which behaviour.**

<details>
<summary>A small navigation map: which file do I open?</summary>

| File                                                | Why you would open it                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| [scene-motion.ts](./src/scene-motion.ts)            | Poses, movement distances, easing, callout timing, heading words      |
| [App.tsx](./src/App.tsx)                            | SVG grouping, rendered elements, scroll measurements, applying values |
| [index.css](./src/index.css)                        | Navy background, divider, font, dimensions, sticky and mobile layout  |
| [scene-updated.svg](./src/assets/scene-updated.svg) | Current card artwork, with four named groups                          |
| [callouts.svg](./src/assets/callouts.svg)           | Leader-line shapes and outlined lettering                             |
| [timed-box.svg](./timed-box.svg)                    | The standalone SMIL alternative                                       |
| [main.tsx](./src/main.tsx)                          | Mounts the React app and imports the CSS                              |
| [index.html](./index.html)                          | The empty root element and browser-tab title                          |
| [package.json](./package.json)                      | Dependencies and dev/build commands                                   |
| `package-lock.json`                                 | Resolved dependency versions                                          |
| `vite.config.ts`                                    | Build plugins and `@` import alias                                    |
| `tsconfig.json`                                     | TypeScript checking and alias resolution                              |
| `src/vite-env.d.ts`                                 | Types for Vite features such as raw imports                           |

Startup is `index.html → main.tsx → App.tsx`.

`dist/` is generated output, not a place to edit. Temporary `/tmp/project365-*.mjs` files are development tests, not website code. Keep `node_modules/`, `dist/`, and generated `*.tsbuildinfo` caches out of commits.

</details>

<details>
<summary>The setup details you can learn later</summary>

**Why import with `?raw`?**

```tsx
import sceneSource from "./assets/scene-updated.svg?raw";
```

Vite returns the markup as text. `DOMParser` reads it, and `readPaths()` extracts each shape's `d`, fill, stroke, and fill/clip rules. React then creates inline SVG elements we can control.

An `<img>` can display the SVG but does not expose its internal groups as page elements we can select directly.

`d` is the geometry; `fill` colours its interior; `stroke` colours its outline. SVG attributes such as `fill-rule` become `fillRule` in JSX. This parser handles the attributes used by this export, not every possible SVG feature.

**What are the React hooks doing?**

- `useRef`: keeps references to the actual section and scene elements.
- `useLayoutEffect`: sets up measurements and listeners after React creates those elements.
- The cleanup function removes listeners, disconnects `ResizeObserver`, and cancels pending animation work.
- Development Strict Mode exercises setup and cleanup, so cleanup must be correct.

`ResizeObserver` and resize events recalculate the scroll distance when the layout changes. The same `getSceneFrame(progress)` input always gives the same pose; the calculation does not remember previous stages or start timers.

**Mobile and accessibility:** below 640px, the heading sits above the artwork. With reduced motion, the long track becomes one viewport, the stack stays still, and a visible text summary names all four agents. Decorative SVG lettering is hidden from screen readers; a real heading and summary provide the meaning. Keyboard users also get a focus-visible "Skip animation" link.

**Font:** Inria Serif is bundled through `@fontsource/inria-serif`. The HTML headings use it. The exported lettering is already vector geometry, so it does not need a runtime font.

</details>

<details>
<summary>The debugging and deployment lessons we should keep</summary>

**Reloading halfway initially reset the scene to the top.** The browser restored scroll before React had mounted the tall section. The document was too short at that instant. Giving `#root:empty` the same height as `.scroll-story` reserves that space before mounting. Reduced-motion styles reserve just one viewport.

**The editor flagged deprecated `baseUrl`.** We removed that option instead of suppressing the warning, then made TypeScript's path alias explicitly relative: `"@/*": ["./src/*"]`. Vite retains its corresponding alias.

**GitHub Pages serves the app from a subpath**, `/project-365/2026/09/19-svg-animation/`. Imported SVG strings and font files are bundled appropriately. Future runtime references to `public/` assets need `import.meta.env.BASE_URL`, not a bare `/image.svg`.

**A pushed commit, a successful deployment, and a gallery listing are separate checks.** Root `catalog.json` controls the gallery. The lesson's standalone `timed-box.svg` sits outside `public/` and is not imported by the app, so the production build does not publish it as another demo URL.

Install and run locally:

```bash
npm ci
npm run dev
```

Typecheck and build:

```bash
npm run build
```

Verify the deployment subpath:

```bash
npm run build -- --base=/project-365/2026/09/19-svg-animation/
npm run preview -- --base=/project-365/2026/09/19-svg-animation/
```

Check the actual browser too: all six poses, intermediate line drawing, one callout at a time, no endpoint callouts, reverse scroll, reload, font loading, mobile overflow, reduced motion, and failed assets or JavaScript errors.

</details>

## Close the file with just this in mind

**Your group is the thing being moved. The numbers say how far.**

```text
scene-updated.svg → the shapes
scene-motion.ts   → the numbers
App.tsx           → apply the numbers to the shapes
index.css         → the stage they sit on
```

If you can explain what `[-120, 0, 0, 0]` does, you already understand the heart of the animation. The rest is how we connect that idea to a browser.
