# One card, one line, one scroll

You know JavaScript. You've never used React. This version is written for that: every new idea gets its own small section, starting with a fake toy example that has nothing to do with this project, then landing on the real code once the idea has clicked.

**Three answers before we start:**

- **Did we use groups like your original? Yes.** We create `<g>` elements in React.
- **Did we use GSAP or Motion? Neither.** On desktop, Lenis smooths scroll input and our TypeScript calculates the pinned scene's poses. Mobile uses native page scrolling with compact illustrations.
- **Is the animation in `App.tsx`? Partly.** `scene-motion.ts` decides the numbers. `App.tsx` applies them.

[The running scroll experiment](https://abdussalam-popsy.github.io/project-365/2026/09/19-svg-animation/) · [Your original timed box, as a runnable SVG](./timed-box.svg)

The old version of this file — denser, more complete, written for someone already comfortable with React — is kept below in a collapsed section. Nothing from it was deleted; it's just no longer the first thing you read.

---

## 1. A component is a function that returns a description of some HTML

Forget this project entirely for a second. Here is the smallest possible piece of React:

```jsx
function Hello() {
  return <h1>hi</h1>;
}
```

That's it. That's a "component." The word sounds heavy; the thing itself is a plain JavaScript function with one rule: **it returns a description of what should appear on screen**, instead of a number or a string.

The weird part is `<h1>hi</h1>` sitting inside a `.js`/`.tsx` file with no quotes around it. That's called **JSX**. It looks like HTML, but it is not HTML — it's syntax sugar that the build tool (Vite, in this project) converts into a plain JavaScript call, roughly:

```js
function Hello() {
  return { type: "h1", props: { children: "hi" } };
}
```

Compare that to an object you already write all the time:

```js
const user = { name: "bob" };
```

Same idea. `Hello()` doesn't paint anything on the screen — it just builds and returns a plain description object, the same way `{ name: "bob" }` just builds and returns data. Nothing appears until some *other* piece of code reads that object and turns it into real DOM elements. We'll meet that other piece of code in [main.tsx](#6-maintsx-the-one-line-that-puts-a-component-on-the-real-page).

**Where this shows up for real:** every file in `src/` that starts with `function SomethingName()` or `export default function SomethingName()` is a component in exactly this sense. [App.tsx](./src/App.tsx) has three of them: `App`, `DesktopExperience`, and (in its own file) `MobileExperience`. None of them are special beyond "a function that returns JSX."

---

## 2. JSX nests, the same way objects nest

Toy example, one level deeper:

```jsx
function Card() {
  return (
    <div>
      <h1>hi</h1>
      <p>bye</p>
    </div>
  );
}
```

This is still just a description object, now with children:

```js
{
  type: "div",
  props: {
    children: [
      { type: "h1", props: { children: "hi" } },
      { type: "p", props: { children: "bye" } },
    ],
  },
}
```

Indentation in JSX mirrors nesting in the eventual page, exactly the way indenting a plain object mirrors nesting in that object. Wrapping the `return` in parentheses is only there so you can spread the JSX across multiple lines without JavaScript's automatic-semicolon-insertion silently ending the `return` early — it has no effect on the result.

One more thing you'll use constantly: curly braces drop you back into plain JavaScript *inside* JSX.

```jsx
function Greeting() {
  const name = "Bob";
  return <h1>hi {name}</h1>;
}
```

`{name}` is not a string — it's "evaluate this JavaScript expression and put the result here." You could put `{name.toUpperCase()}` or `{1 + 1}` in there just as validly.

**Where this shows up for real:** open [App.tsx:204-322](./src/App.tsx). The `return` statement of `DesktopExperience` is one big nested JSX tree — `<main>` containing a `<section>` containing a `<div className="scene">` and so on. It looks big, but it's the exact same nesting rule as the two-line `Card` example above, just deeper. We'll walk that specific tree in [part 11](#11-put-the-two-together-grabbing-real-elements-and-wiring-up-scroll).

---

## 3. Props: how a function receives data

A component is a function, and functions take arguments. In React those arguments are called **props**, and they arrive as one single object.

```jsx
function Hello({ name }) {
  return <h1>hi {name}</h1>;
}
```

`{ name }` here is plain JavaScript destructuring — the same thing as:

```js
function formatUser({ firstName }) {
  return firstName;
}
```

You're not learning a new syntax, just recognizing an old one in a new place. To use the component and supply that argument, JSX has its own way of writing "call this function with these props":

```jsx
<Hello name="Bob" />
```

This is equivalent to calling `Hello({ name: "Bob" })`. The attribute-looking syntax (`name="Bob"`) is just how JSX spells "pass this key and value into the props object."

**Predict before you scroll:** if you wrote `<Hello name="Ada" />` instead, what would appear on the page?

<details>
<summary>Reveal the answer</summary>

`hi Ada`. The prop is just a function argument — whatever string you pass becomes `name` inside the function body.

</details>

**Where this shows up for real:** [App.tsx:76-83](./src/App.tsx) has:

```tsx
export default function App() {
  const isMobile = useSyncExternalStore(subscribeToLayout, getMobileLayout);
  return isMobile ? (
    <MobileExperience cardLayers={cardLayers} />
  ) : (
    <DesktopExperience />
  );
}
```

`<MobileExperience cardLayers={cardLayers} />` passes one prop, `cardLayers`, into `MobileExperience`. On the receiving end, [MobileExperience.tsx:8-10](./src/MobileExperience.tsx):

```tsx
export default function MobileExperience({
  cardLayers,
}: MobileExperienceProps) {
```

destructures that same prop out, exactly like the toy `Hello({ name })` above. `useSyncExternalStore` is a separate idea — we'll get to it in [part 8](#8-reading-a-value-that-lives-outside-react-usesyncexternalstore). For now, just notice the shape: prop goes in on the left of the JSX tag, comes out as a destructured function parameter on the other end.

---

## 4. Turning a list of data into a list of elements

Plain JavaScript, nothing React-specific yet:

```js
const letters = ["a", "b", "c"];
const upper = letters.map((letter) => letter.toUpperCase());
// ["A", "B", "C"]
```

`.map()` takes an array and returns a new array, one output per input. You've used this before. JSX uses the exact same method to build a list of elements:

```jsx
function List() {
  const letters = ["a", "b", "c"];
  return (
    <ul>
      {letters.map((letter) => (
        <li key={letter}>{letter}</li>
      ))}
    </ul>
  );
}
```

`{letters.map(...)}` drops back into JavaScript (same curly-brace rule from part 2), runs `.map()`, and gets back an array of `<li>` description objects instead of an array of strings. React is fine rendering an array of elements directly.

The one new piece is `key={letter}`. React needs a way to tell "this exact list item" apart from the others when the list changes later, so it can update the right one instead of guessing. It isn't an HTML/SVG attribute you can inspect on screen — it never appears in the rendered page. For a list that never reorders, an index works as a key; for one that does, use a stable id like we did here.

**Where this shows up for real:** [MobileExperience.tsx:41](./src/MobileExperience.tsx) does exactly this over real data:

```tsx
{agents.map((agent, index) => (
  <section className="mobile-agent" key={agent.id} /* ... */>
    {/* one section per agent: Scheduling, Onboarding, Retention, Payroll */}
  </section>
))}
```

`agents` is an array of four objects defined in [scene-motion.ts:1-42](./src/scene-motion.ts) — we'll meet that file properly in [part 12](#12-the-scroll-math-lives-in-plain-javascript-not-react-scene-motionts). For now: four data objects in, four `<section>` elements out, same `.map()` you already knew.

---

## 5. How many files does this actually need?

Before going further into `App.tsx`, it's worth being explicit about something: **none of the ideas above require more than one file.** You could write this entire toy example in a single `.jsx` file:

```jsx
function Hello() {
  return <h1>hi</h1>;
}
```

and that would run. React does not demand that data live in one file, components in another, and styles in a third. Splitting things up is a choice this project's author made for readability, not a rule React enforces.

This project happens to split things four ways:

| Job | File in this project | Plain-JS equivalent you already know |
| --- | --- | --- |
| Put the component onto the real page | [main.tsx](./src/main.tsx) | `document.getElementById("root").append(realElement)` |
| Describe what's on screen, wire up events | [App.tsx](./src/App.tsx) | A `<script>` tag full of DOM-building code |
| Plain numbers and data the UI reads | [scene-motion.ts](./src/scene-motion.ts) | A separate `data.js` file you `import` |
| Visual styling | [index.css](./src/index.css) | A `<link rel="stylesheet">` |

Keep that table in your head as a map. Every file below fills exactly one of those four jobs and nothing more.

---

## 6. main.tsx: the one line that puts a component on the real page

We said in part 1 that a component just returns a description object — nothing appears until something else reads it. That something else lives here, in [main.tsx](./src/main.tsx):

```tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    {/* ...dev-only tooling, see below */}
  </StrictMode>,
);
```

Read it in two pieces:

- `document.getElementById("root")` — plain browser JavaScript you already know, finding the empty `<div id="root">` in [index.html](./index.html).
- `createRoot(...).render(<App />)` — "build real DOM nodes from `<App />`'s description, and insert them into that element." This is the missing piece from part 1's toy example.

`<StrictMode>` wraps things to make React double-check your components in development (it can call some functions twice on purpose, to surface mistakes early). It disappears in the production build and doesn't change what you see.

The rest of the file is a dev-only annotation tool (`Agentation`) that only loads while you're running `npm run dev`, and is stripped out of the real build entirely — safe to ignore while you're learning the core pieces. Its lazy-loading mechanics are covered in the collapsed appendix at the bottom of this file if you want them later.

**Predict before you scroll:** if `index.html` didn't have an element with `id="root"`, what would happen when this file ran?

<details>
<summary>Reveal the answer</summary>

`document.getElementById("root")` would return `null`, and calling `createRoot(null)` would fail — the same way any plain JavaScript `null.something()` call would. React doesn't invent a container; it needs a real element to attach to, exactly like the toy `document.getElementById(...).append(...)` example in the table above.

</details>

---

## 7. A component can return different JSX depending on a condition

Another toy example, still nothing project-specific:

```jsx
function Greeting({ isFormal }) {
  return isFormal ? <p>Good day.</p> : <p>Hey!</p>;
}
```

This is a ternary — `condition ? a : b` — the same one you use in plain JavaScript to pick between two values. Here it picks between two *pieces of JSX* instead of two numbers or strings. React mounts whichever one the condition currently points to; the other one is never built.

**Where this shows up for real:** [App.tsx:76-83](./src/App.tsx), the same lines from part 3:

```tsx
return isMobile ? (
  <MobileExperience cardLayers={cardLayers} />
) : (
  <DesktopExperience />
);
```

One condition, `isMobile`, picks between two entire experiences. This matters for more than looks: when `isMobile` flips from `false` to `true`, `DesktopExperience` isn't just hidden with CSS — it's actually removed, which (as we'll see once effects are covered) is what shuts off its scroll listeners and destroys its Lenis instance. Switching back mounts a fresh `DesktopExperience` from scratch.

We still haven't covered where `isMobile` itself comes from — that's next.

---

## 8. Reading a value that lives outside React: `useSyncExternalStore`

The browser already knows things React doesn't automatically track — like whether a media query currently matches. Toy example of reading one such value safely:

```jsx
function subscribe(callback) {
  const query = window.matchMedia("(max-width: 800px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getIsNarrow() {
  return window.matchMedia("(max-width: 800px)").matches;
}

function Layout() {
  const isNarrow = useSyncExternalStore(subscribe, getIsNarrow);
  return isNarrow ? <NarrowView /> : <WideView />;
}
```

`useSyncExternalStore` takes two plain functions:

- `getIsNarrow` — "give me the current value, right now." Just reads `.matches`, nothing fancy.
- `subscribe` — "call `callback` whenever that value might have changed, and tell me how to stop listening later." It returns a cleanup function, same shape as any event-listener cleanup you'd write by hand.

React calls `getIsNarrow` to render, then uses `subscribe` to know when to re-render with a fresh value. You're not learning a new way to listen for change — `addEventListener`/`removeEventListener` is exactly what you already know — you're learning the two-function shape React wants so it can hook that existing pattern into a re-render.

**Where this shows up for real:** [App.tsx:63-83](./src/App.tsx):

```tsx
const mobileLayout = window.matchMedia(
  "(max-width: 640px), (max-width: 1024px) and (pointer: coarse)",
);

function subscribeToLayout(onChange: () => void) {
  mobileLayout.addEventListener("change", onChange);
  return () => mobileLayout.removeEventListener("change", onChange);
}

function getMobileLayout() {
  return mobileLayout.matches;
}

export default function App() {
  const isMobile = useSyncExternalStore(subscribeToLayout, getMobileLayout);
  // ...
}
```

Same two functions, same shape as the toy version. The query itself just adds a second condition (a coarse pointer up to 1024px wide) so tablets and landscape phones also get the reading layout. `isMobile` is exactly the condition from part 7's ternary.

---

## 9. Refs: a box that will hold a real DOM element later

New idea, on its own, with no effects yet. Toy example:

```jsx
function Box() {
  const divRef = useRef(null);
  return <div ref={divRef}>hello</div>;
}
```

`useRef(null)` does something almost boringly simple — it creates one plain object that looks like this:

```js
{ current: null }
```

That's genuinely it. `useRef` just hands you a box with one property, `current`, and React guarantees that same box survives across re-renders instead of getting rebuilt every time (unlike a normal `let` inside the function body, which resets).

`ref={divRef}` on a JSX element is a special instruction, separate from every other prop: "once you build the *real* DOM node for this `<div>`, put it in `divRef.current`." Before that happens — while the component is still just returning a description object, as in part 1 — `divRef.current` is `null`. It only becomes the actual `<div>` element after React has built real DOM from the description.

**Where this shows up for real:** [App.tsx:86-87](./src/App.tsx):

```tsx
const storyRef = useRef<HTMLElement>(null);
const sceneRef = useRef<HTMLDivElement>(null);
```

and further down, on the JSX itself, [App.tsx:211](./src/App.tsx) and [App.tsx:214](./src/App.tsx):

```tsx
<section className="scroll-story" ref={storyRef} /* ... */>
  <div className="scene" ref={sceneRef}>
```

`<HTMLElement>` and `<HTMLDivElement>` are TypeScript type arguments — they tell the type checker what kind of element to expect in `.current`, the same way `<SVGGElement>` did back in part 4's list example. They don't change what happens at runtime; they just give you autocomplete and catch mistakes while writing code.

We still have `divRef.current === null` at first and a real element later — but nothing has read `.current` yet. That's the next piece.

---

## 10. Running code after the DOM exists: `useLayoutEffect`

Keep this section only about the effect itself — refs come back in part 11. Toy example:

```jsx
function Box() {
  useLayoutEffect(() => {
    console.log("the div now exists in the real page");
  }, []);
  return <div>hello</div>;
}
```

`useLayoutEffect(fn, [])` means: "after React has built real DOM for this render, run `fn` once." The empty array, `[]`, is a list of dependencies — values that, if they changed, would make React re-run `fn`. An empty list means "there's nothing to watch, so only run this the first time."

Think of it as a scoped `window.onload`: instead of "run once the whole page has loaded," it's "run once *this particular* component's DOM exists." (There's a near-identical hook, `useEffect`, that runs very slightly later — after the browser has already painted the frame. `useLayoutEffect` runs first, which matters when you need to measure something before the user sees it. That distinction is the only new fact in this paragraph; everything else about the two is the same.)

**Where this shows up for real:** the outer shape of [App.tsx:89-202](./src/App.tsx):

```tsx
useLayoutEffect(() => {
  // ... setup ...

  return () => {
    // ... cleanup ...
  };
}, []);
```

Same `[]` as the toy example — this setup runs once when `DesktopExperience` mounts, not on every re-render. The `return () => { ... }` part is new: whatever function you return from inside the effect is a **cleanup function**, and React calls it right before the component is removed (for example, when `isMobile` flips to `true` and `DesktopExperience` unmounts, from part 7). It's where you undo whatever the setup did — remove listeners, stop timers — so nothing keeps running after the component is gone.

**Predict before you scroll:** in the toy `Box` example, if you changed `[]` to `[]` but ran the component twice on the same page, would `console.log` run once or twice?

<details>
<summary>Reveal the answer</summary>

Twice — once per mounted `Box`. `[]` means "don't re-run *this* component's effect on later renders," not "only ever run once across the whole app." Each separate `<Box />` gets its own independent effect.

</details>

---

## 11. Put the two together: grabbing real elements and wiring up scroll

Now combine part 9 (refs) and part 10 (effects), which is exactly what the real code does. Toy version first:

```jsx
function Box() {
  const divRef = useRef(null);
  useLayoutEffect(() => {
    console.log(divRef.current); // the real <div>, not null anymore
  }, []);
  return <div ref={divRef}>hello</div>;
}
```

Inside `useLayoutEffect`, the DOM has already been built (that's the whole point of "runs after"), so `divRef.current` is now the actual `<div>` element instead of `null`. This is the only moment in the component's life where you're guaranteed that.

**Where this shows up for real**, [App.tsx:90-110](./src/App.tsx):

```tsx
useLayoutEffect(() => {
  const story = storyRef.current!;
  const scene = sceneRef.current!;
  const cards = agents.map(
    (agent) => scene.querySelector<SVGGElement>(`[data-card="${agent.id}"]`)!,
  );
  // ...more querySelector calls for callouts, lines, labels, the timeline...
```

`storyRef.current!` reads the real element from the box, exactly like the toy example — the trailing `!` is a TypeScript-only annotation meaning "I promise this isn't null," and it disappears at runtime; it doesn't add a safety check. Once we have the real `<div className="scene">` element (`scene`), we can call ordinary DOM methods on it — `querySelector`, the same method you'd call on `document` in any vanilla JS project.

From there the rest of the effect is plain browser code you already know how to read:

- `new Lenis({...})` — a normal `new` call constructing a library object (covered in the collapsed Lenis appendix below).
- `window.addEventListener("scroll", schedule, { passive: true })`, `new ResizeObserver(measure)` — ordinary browser APIs.
- The `render()` function reads `window.scrollY`, calls `getSceneFrame(progress)` (next section), and calls `setAttribute`/`style.setProperty` on the elements we grabbed above.
- The `return () => { lenis.destroy(); observer.disconnect(); window.removeEventListener(...); }` cleanup undoes every one of those, per part 10's rule.

Nothing here is a new React concept — it's the ref-plus-effect pattern from this section, applied to real elements instead of one toy `<div>`.

---

## 12. The scroll math lives in plain JavaScript, not React: scene-motion.ts

Open [scene-motion.ts](./src/scene-motion.ts). It has no `import React`, no JSX, no hooks. It's an ordinary module: data in, a function that does arithmetic, numbers out. That's deliberate — this file doesn't need to know a browser exists.

Toy version of the core idea, interpolation, using numbers with no relation to this project:

```js
function between(start, end, t) {
  return start + (end - start) * t;
}

between(0, 100, 0.25); // 25 — a quarter of the way from 0 to 100
between(0, 100, 0.5); // 50 — halfway
```

That one-line formula — "start, plus the gap to end, scaled by a fraction `t`" — is the entire idea behind every moving number in this animation. The real file just applies it to more numbers, more often, with some easing to soften the start and end of each move.

**Where this shows up for real.** The four cards' vertical offsets live here, [scene-motion.ts:56-63](./src/scene-motion.ts):

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

Each row is one "pose," a snapshot of where all four cards sit. Each column is one card, in the same order as `agents`: Scheduling, Onboarding, Retention, Payroll. `positions[1][0]` is `-120` — pose 1, card 0 (Scheduling) — meaning "in this pose, Scheduling has moved up 120 units." Reading `[column]` off an array by number is the exact same indexing you used with `letters[0]` in part 4; there's nothing new here except that this array is two levels deep.

`getSceneFrame(progress)`, [scene-motion.ts:74-111](./src/scene-motion.ts), takes a single number from 0 to 1 (how far the user has scrolled through this section) and returns an object with the current card offsets, colors, and callout positions — using `between(...)`-style math (the real function is called `ease`, and softens the start/end of each blend, but the core idea is the toy formula above) to blend between two neighboring rows of `positions`. The same `progress` always produces the same result — nothing is remembered between calls — which is exactly why scrolling back up smoothly reverses the animation instead of needing a separate "play in reverse" mode.

`App.tsx` is the only file that calls `getSceneFrame` and only file that touches the DOM with the result — the split from part 5's table in action: this file is pure data and math, `App.tsx` is where that math meets real elements.

**Predict before you scroll:** if you changed the second row of `positions` from `[-120, 0, 0, 0]` to `[-200, 0, 0, 0]`, which card's motion changes?

<details>
<summary>Reveal the answer</summary>

Only Scheduling (column 0). Every other entry in that row is still `0`, so Onboarding, Retention, and Payroll are unaffected at that pose. Try it locally, scroll, then change it back before your next experiment.

</details>

---

## 13. CSS variables: how a JS number becomes a color or position on screen

Last new idea. Plain CSS you may already know:

```css
.box {
  --side: 40px;
  width: var(--side);
}
```

A CSS custom property (`--side`) is a named value you can set once and read with `var(...)` anywhere inside that element or its children. JavaScript can set one of these directly on a real element:

```js
element.style.setProperty("--side", "80px");
```

That's the entire mechanism — no animation library, just "change a named CSS value, and let CSS decide what to do with it."

**Where this shows up for real**, [App.tsx:134](./src/App.tsx):

```ts
card.style.setProperty("--card-focus", focus);
```

`focus` is a percentage string like `"40%"`, coming out of `getSceneFrame` from part 12. On the CSS side, [index.css:213-219](./src/index.css):

```css
.agent-card {
  --card-face: color-mix(in srgb, #59637b, #fff var(--card-focus, 0%));
}
```

`color-mix(in srgb, colorA, colorB percentage)` blends two solid colors by that percentage — at `0%` you get muted grey-blue, at `100%` you get the original white. Neither color is transparent, so the card never becomes see-through; it just shifts along a fixed blend. JavaScript never touches color directly here — it only ever changes the one number, `--card-focus`, and CSS owns turning that number into an actual color.

**Predict before you scroll:** if `getSceneFrame` returned `focus = 1` (100%) for every card, all the time, what would change about how the animation looks?

<details>
<summary>Reveal the answer</summary>

Every card would stay at full brightness/color the whole time — nothing would ever look muted, because `--card-focus` would always sit at `100%`. The cards would still move (that's driven by a completely separate value, `frame.cards`), but the "spotlight" effect that dims inactive cards would disappear.

</details>

---

## 14. Rereading App.tsx, now that every piece is familiar

Here's the same file from part 11, described in the language you now have, top to bottom:

```text
App.tsx
├── read the SVG source once when the file loads (plain DOMParser code, part 1's "not React" idea)
├── App(): reads isMobile with useSyncExternalStore (part 8)
│   └── returns MobileExperience or DesktopExperience (part 7's conditional JSX)
└── DesktopExperience():
    ├── storyRef, sceneRef: two boxes, empty at first (part 9)
    ├── useLayoutEffect(..., []): runs once the real DOM exists (part 10)
    │   ├── reads storyRef.current / sceneRef.current (part 11)
    │   ├── queries child elements with plain querySelector
    │   ├── creates Lenis, adds scroll/resize listeners
    │   ├── render(): scrollY → progress → getSceneFrame(progress) (part 12)
    │   │   └── setAttribute / style.setProperty (part 13)
    │   └── return cleanup: destroy Lenis, remove listeners (part 10's cleanup rule)
    └── return (...): the JSX tree, nested exactly like part 2's toy Card
```

Every line in the real file maps to one of the ideas above. Nothing in `App.tsx` is a concept you haven't already seen in isolation — it's the same handful of ideas, combined.

---

## Try these three experiments, one at a time

Run `npm run dev` inside this experiment at desktop width. Restore each change before moving to the next, so you can tell which setting caused which effect.

| Try this | Where | What to notice |
| --- | --- | --- |
| First `-120` → `-200` | `positions`, in `scene-motion.ts` | Scheduling rises farther; its callout follows |
| `650svh` → `850svh` | `index.css` | Same poses, more scroll distance between them |
| `--copy-top: 33.5svh` → `25svh` in `.copy-panel` | `index.css` | Desktop headings sit higher; cards are unchanged |

## Close the file with just this in mind

**A component is a function. JSX is the object it returns. A ref is a box for a real element. An effect is "run this after that element exists." Everything past that is arithmetic and CSS.**

```text
scene-updated.svg → the shapes
scene-motion.ts   → the numbers
App.tsx           → apply the numbers to the shapes
index.css         → the stage they sit on
```

If you can explain what `[-120, 0, 0, 0]` does, and why `divRef.current` is `null` until an effect runs, you already understand the heart of this project. Everything else in the collapsed section below is depth, not a different idea.


---

<details>
<summary>Old / complex explanation (original)</summary>

# One card, one line, one scroll

A guided tour of the SVG experiment. Follow **Scheduling** from a drawing to a moving card, instead of trying to memorise the whole app.

**Three answers before we start:**

- **Did we use groups like your original? Yes.** We create `<g>` elements in React.
- **Did we use GSAP or Motion? Neither.** On desktop, Lenis smooths scroll input and our TypeScript calculates the pinned scene's poses. Mobile uses native page scrolling with compact illustrations.
- **Is the animation in `App.tsx`? Partly.** `scene-motion.ts` decides the numbers. `App.tsx` applies them.

Read the short story below. **Tap the expandable sections only when you want the syntax or maths.** They work in GitHub's rendered Markdown, including on a phone.

[The running scroll experiment](https://abdussalam-popsy.github.io/project-365/2026/09/19-svg-animation/) · [Your original timed box, as a runnable SVG](./timed-box.svg)

## File walkthroughs — read one file at a time

The story below follows a card. These expandable walkthroughs follow the **actual source files**, including the syntax and decisions that connect the pieces.

The Three.js starter is a different app: [read its own `App.tsx` walkthrough here](../../../templates/threejs/lessons.md).

<details>
<summary>@file: src/App.tsx — imports, nested elements, indexes, and the whole data flow</summary>

[Open this experiment's App.tsx](./src/App.tsx).

### The file's job

This file prepares the shared artwork and chooses between two layouts. The exported `App` renders `MobileExperience` for phones/small touch screens, or `DesktopExperience` for the original pinned scene. The desktop helper contains the refs, Lenis setup, scroll calculations, and JSX described below.

The SVG files supply geometry; `scene-motion.ts` supplies agent data and desktop poses; CSS supplies the visual layout. Read this file in five passes: **imports → prepare the shapes → choose the layout → connect desktop events → build the element tree**.

### 1. Imports: what enters this file?

The React import names `useLayoutEffect`, `useRef`, `useSyncExternalStore`, and two types. `Lenis` is imported separately. The file also imports the SVG strings, motion helpers, and `MobileExperience` component.

| Import                         | What we use it for                                                 |
| ------------------------------ | ------------------------------------------------------------------ |
| `useRef`                       | Keep references to actual browser elements                         |
| `useSyncExternalStore`         | Subscribe React to the browser's layout media query                |
| `MobileExperience`             | Render the text-first, native-scrolling layout                     |
| `useLayoutEffect`              | Set up measurements and event listeners after those elements exist |
| `type CSSProperties`           | Tell TypeScript about an inline CSS style object                   |
| `type SVGProps`                | Describe the attributes accepted by an SVG path                    |
| `Lenis`                        | Create the smooth-scroll controller                                |
| `sceneSource`, `calloutSource` | Raw SVG markup strings                                             |
| `agents`, `headings`           | Named data used to build repeated elements                         |
| `getSceneFrame`                | Calculate movement/colour values at a scroll position              |
| `clamp`                        | Keep progress in its allowed range                                 |

Curly-brace imports pick named exports. `import Lenis from "lenis"` is a default import. `./scene-motion` is a local module; `lenis` is an installed package. Vite's `?raw` suffix means “import this file's text,” not “display it as an image.”

The `type` imports disappear from the built JavaScript. Types describe expectations to the checker; they do not create visible elements.

### 2. Types and fallbacks are not animation instructions

```ts
type Path = SVGProps<SVGPathElement>;
```

This gives a shorter name to “the React props supported by an SVG path.” The angle brackets supply a type argument; this is not a JSX element.

```ts
const cardPalette: Record<string, string> = {
  white: "var(--card-face)",
  black: "var(--card-ink)",
  "#c0d8fb": "var(--card-light-side)",
  "#94bdfa": "var(--card-blue-side)",
  "#0d2872": "var(--card-recess)",
};
```

`Record<string, string>` says the object maps string keys to string values. The object translates drawing colours into CSS-variable references; it does not modify the SVG file.

```ts
function cardPaint(paint?: string) {
  return paint ? (cardPalette[paint.toLowerCase()] ?? paint) : undefined;
}
```

For `paint = "#C0D8FB"`, lowercasing finds the `"#c0d8fb"` key and returns `"var(--card-light-side)"`. CSS later resolves the actual colour.

Decode the punctuation:

- `paint?: string`: this parameter is optional.
- `condition ? a : b`: choose one of two results.
- `?? paint`: if the lookup is null or undefined, keep the original value. It does not reject valid zero/false values the way `||` would.
- `undefined`: no value is supplied for that optional attribute.

For `paint = "none"`, there is no palette entry, so `?? paint` keeps `"none"`. We do not accidentally fill outline-only shapes.

### 3. Read the SVG, then organise its data

`readSvg()` uses `DOMParser` to turn text into a document we can inspect. Its parser-error check catches malformed XML.

`readPaths()` reads the path elements inside that document or a named group. `Array.from(..., callback)` turns the collection into an ordinary array and transforms each element into a plain object of attributes.

The callback returns an object with this shape:

```ts
({ d: "...", fill: "white", stroke: undefined });
```

This small object is an illustrative shape of the data, not replacement drawing geometry. Parentheses around an object literal in an arrow callback let it be returned as a value rather than mistaken for the function's statement block.

SVG attributes such as `fill-rule` are translated into React's `fillRule` names. A cast such as `as Path["fillRule"]` tells TypeScript which allowed attribute type we expect. It is not a runtime conversion or validation step.

Next:

```ts
const cardLayers = [...agents].reverse().map(({ id }) => {
  const group = sceneDocument.getElementById(id);
  if (!group) throw new Error(`Missing SVG card group: ${id}`);
  return readPaths(group);
});
```

- `[...agents]` makes a copy, so reversing it does not mutate the original ordering.
- `.map()` produces one result per item.
- `({ id })` extracts the `id` field from the current agent object. This is destructuring, not JSX.
- The callback uses `{ ... }` as a statement body, so it needs an explicit `return`.
- Backticks and `${id}` insert a value into an error message.

This prepares the drawing data once when the module loads, rather than reparsing it on every scroll. It is browser code: moving this module into a server-rendered app would require handling `DOMParser` on the client or at build time.

### 4. One card has several indexes — follow Onboarding

Indexes are positions in arrays, not permanent identities. This is why each array's order matters.

| Collection                                                                       | Onboarding's position |
| -------------------------------------------------------------------------------- | --------------------- |
| `agents`: Scheduling, Onboarding, Retention, Payroll                             | 1                     |
| `cardLayers`: Payroll, Retention, Onboarding, Scheduling                         | 2                     |
| `headings`: introduction, Scheduling, Onboarding, Retention, Payroll, conclusion | 2                     |
| `cards`, queried back from the DOM in `agents` order                             | 1                     |

When rendering `cardLayers[2]`, the name lookup is `agents[3 - 2]`, giving `agents[1]`, Onboarding. The rendered group gets `data-card="onboarding"`.

The effect then does `agents.map(...)` and queries each `data-card` by name. That rebuilds the DOM-reference array in **agent order**. So `cards[1]` is Onboarding, even though it was painted third.

At 40% progress, `frame.cards[1]` is `-120`. The update applies `translate(0 -120)` to `cards[1]`. The number reaches the correct object because the array order was deliberately aligned.

For the heading, `headings[2]` is Onboarding. Subtracting 1 skips the introduction: `agents[2 - 1]` gives that same agent.

For its SVG callout, the source pairs are in reverse order. `(4 - 1 - 1) * 2 = 4`, so path 4 is the lettering and path 5 is the line, counting from zero.

**Reusable pattern:** keep a stable identity (`id`) when you rearrange data, then look objects up by that identity. Do not assume every array uses the same index.

### 5. Choose the layout, then connect its elements

`App` uses `useSyncExternalStore(subscribeToLayout, getMobileLayout)` to read the browser's media query and update when it changes. `subscribeToLayout` adds a `change` listener and returns a cleanup function; `getMobileLayout` returns the current Boolean `.matches` value.

The query selects mobile at widths up to 640px, or up to 1024px when the primary pointer is coarse, such as a touchscreen. This also keeps common phone landscape orientations in the reading layout.

```tsx
return isMobile ? (
  <MobileExperience cardLayers={cardLayers} />
) : (
  <DesktopExperience />
);
```

The ternary selects **one mounted component**, not two trees hidden with CSS. `cardLayers={cardLayers}` passes the already parsed artwork into the mobile component. The prop name is on the left; the JavaScript variable being supplied is inside the braces on the right.

This matters for behaviour, not just appearance. When leaving desktop, its effect cleanup destroys Lenis and removes its scroll listeners. Mobile uses native page scrolling and never mounts the desktop animation controller. Switching back mounts the original desktop experience again.

The refs and effects below belong to `DesktopExperience`, in the same file.

```tsx
const storyRef = useRef<HTMLElement>(null);
const sceneRef = useRef<HTMLDivElement>(null);
```

At first there is no element, so the references start as `null`. React fills them when it renders `ref={storyRef}` and `ref={sceneRef}`.

`useLayoutEffect(() => { ... }, [])` runs setup after those elements have been created. The empty dependency list means the effect does not rerun merely because an ordinary render happens. Development Strict Mode still exercises setup and cleanup.

Inside it, `storyRef.current!` means “I expect this reference to be non-null now.” The `!` tells TypeScript that assumption; it does not create a fallback if the element is actually missing.

The `querySelector<SVGGElement>(...)` type argument similarly tells TypeScript what kind of element we expect. The selector string does the actual finding.

We cache the card, line, label, timeline, and text-track elements once. Their identities do not change during scrolling.

### 6. Lenis changes the input, not the illustration

The effect creates one `new Lenis({...})` controller. `new` constructs a library object that manages its own state/listeners. The options object supplies named inputs such as `lerp` and `eventsTarget`.

The detailed Lenis walkthrough below explains each option. The important connection here is: Lenis changes the browser's real scroll position; our existing `window.scrollY` calculation still drives the scene.

Agentation is outside `.scene`, so `eventsTarget: scene` keeps Lenis from consuming wheel gestures inside the annotation controls.

### 7. render() applies a calculated frame

This local `render()` is not React's renderer. It is our function that updates existing DOM attributes.

The sequence is:

```text
window.scrollY
    ↓ normalise by this section's start and usable distance
progress between 0 and 1
    ↓ getSceneFrame(progress)
cards, focus, marker, callouts
    ↓ setAttribute / style.setProperty / style.transform
visible movement and colour
```

For example:

```ts
card.setAttribute("transform", `translate(0 ${frame.cards[index]})`);
card.style.setProperty("--card-focus", focus);
```

The first changes an SVG attribute. The second changes a CSS custom property, which the card's child paths inherit through their colour variables.

`copyTrack.style.transform` moves the whole text stack. The shared timeline gets its own offset and colour values, so it can stay still while that text passes. Callouts have separate line-drawing and text-opacity values.

This is deliberate separation: the model computes numbers, and the view applies them. Changing a colour formula does not require reparsing the SVG or rebuilding the React tree.

### 8. Why setup has a cleanup function

`schedule()` allows only one pending scene update per browser frame. `measure()` refreshes the section's start and usable scroll distance. `ResizeObserver` handles size changes; browser listeners handle scroll, resize, page restoration, and motion-preference changes.

The effect returns another function. React calls it when cleaning up this setup:

- `lenis.destroy()` removes its listeners and frame loop.
- `cancelAnimationFrame(request)` cancels our pending scene update.
- `observer.disconnect()` stops observing sizes.
- `removeEventListener(...)` removes the callbacks we registered.

Without cleanup, a remount could leave multiple controllers responding to the same input. Setup and teardown are two halves of one responsibility.

### 9. Read the desktop JSX as a tree, not one huge expression

```text
main
├── skip link
├── scroll-story (measured outer distance)
│   └── scene (pinned viewport)
│       ├── copy-panel (clips overflowing text)
│       │   ├── copy-track (moves)
│       │   │   └── six copy-sections
│       │   └── step-timeline (enters, pins, exits)
│       └── illustration-panel
│           └── svg
│               ├── callout groups
│               └── card groups
└── after-scene (skip-link destination)
```

The timeline is a sibling of the text track, not a child of it. If it were inside that moving track, it would move along with every heading instead of staying pinned.

The callouts render before the card groups because later SVG elements cover earlier ones. A path nested in a `<g>` inherits that group's movement.

`headings.map(...)` creates six sections. Inside the callback, `const Heading = index === 0 ? "h1" : "h2"` chooses which HTML heading tag to render. Uppercase `<Heading>` tells React to use that variable; its value is a tag name.

`agent && (...)` renders the eyebrow only when there is an agent. The introduction and conclusion have no matching agent, so the decoration is omitted.

`agent?.id` means “read id if agent exists.” It is different from `paint?: string`, which declares an optional parameter, and from `condition ? a : b`, which chooses a value.

### 10. Props can forward data and then override one piece

```tsx
<path
  {...path}
  fill={cardPaint(path.fill)}
  stroke={cardPaint(path.stroke)}
  key={pathIndex}
/>
```

`{...path}` forwards the saved path attributes. The later `fill` and `stroke` props replace only those two values with palette references. Geometry and outline thickness are retained.

The order matters: putting `{...path}` last would overwrite those palette references with the original colours.

`key` helps React identify repeated elements. It is not an HTML/SVG attribute you can query. These fixed path collections do not reorder during animation, so an index works here. For a dynamic list whose entries can be inserted/reordered, prefer stable IDs.

The inline `style` object on an agent section contains `"--agent-accent"`. The key is quoted because hyphenated CSS-property names are not normal JavaScript identifiers. `as CSSProperties` is a TypeScript assertion so the custom property can be supplied; CSS still receives a normal string colour.

**Prediction:** if you changed `agents[1].accent`, would it change the cube geometry, the Onboarding label's identity, or the accent colour?

It changes the accent colour. Geometry comes from a different file; identity comes from `id`. A well-separated input changes one responsibility without rewriting the rest.

</details>

<details>
<summary>@file: src/MobileExperience.tsx — a text-first layout, not a smaller desktop animation</summary>

[Open the mobile component](./src/MobileExperience.tsx).

### Why this is a different component

The previous mobile layout reserved 25% of the screen for text and roughly 75% for the illustration. It fitted the available width, but the animation still controlled the reading experience.

The new layout changes the structure, not just the percentages:

```text
mobile-experience
├── introduction: heading + short paragraph
├── Scheduling: eyebrow → heading → sentence → card
├── Onboarding: eyebrow → heading → sentence → card
├── Retention: eyebrow → heading → sentence → card
├── Payroll: eyebrow → heading → sentence → card
└── short closing line
```

All sections participate in ordinary page flow. There is no `.scroll-story`, fixed text window, shared sticky marker, or Lenis instance in this layout. The user scrolls the browser normally, and longer text naturally makes its section taller.

### 1. Pass the existing artwork in, rather than copy it

```ts
type MobileExperienceProps = {
  cardLayers: SVGProps<SVGPathElement>[][];
};
```

The two `[]` pairs mean an array of arrays: the outside array holds cards, and each inside array holds that card's path props.

```tsx
function MobileExperience({ cardLayers }: MobileExperienceProps);
```

This is a signature excerpt. `{ cardLayers }` extracts the named prop supplied by `App`. The type after `:` tells TypeScript what that props object should contain. No SVG file is copied or reparsed here.

`agents.map(...)` renders one section per agent. The title, label, accent, and new `description` field come from the shared data. Desktop does not render `description`, so adding it does not alter the desktop composition.

The source groups remain in back-to-front order, while the reading sections use agent order:

```tsx
cardLayers[agents.length - 1 - index];
```

For Scheduling, `index = 0`, so `4 - 1 - 0 = 3`: take the fourth drawing group. For Payroll, `index = 3`, so take group 0. This reuses the same index relationship explained earlier, but each card now gets its own SVG viewport.

### 2. Crop the empty space, not the artwork

The full desktop SVG has a tall coordinate window because the cards need room to lift and stack. Shrinking that whole window on a phone wastes space and makes the artwork tiny.

Each mobile SVG instead uses:

```tsx
viewBox={`-16 ${agent.top - 60} 444 340`}
```

A `viewBox` is `left, top, width, height`, measured in the drawing's coordinate units.

For Retention, `agent.top` is 681, so the window is `-16 621 444 340`. Its vertical range is 621–961. The current artwork's bounds are approximately 633.46–939.5, leaving room for the icon and strokes.

This changes the window through which we see the original paths; it does not rewrite their coordinates. The 60-unit allowance above the card accommodates raised icons. If a future icon extends farther, recheck this crop instead of assuming the same padding always fits.

The CSS frame is also capped:

```css
height: min(62vw, 35svh, 240px);
```

At a 390×844 viewport, the candidates are 241.8px, 295.4px, and 240px, so the frame is 240px high. At 320×568, it is about 198.4px. It no longer reserves most of the screen for a tall animation stage.

### 3. A small reveal, not a scroll timeline

`useEffect` creates an `IntersectionObserver` for the illustration frames. The browser reports when each figure enters the viewport; we do not calculate a six-stage scroll pose on mobile.

```ts
if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
  entry.target.setAttribute("data-revealed", "true");
  observer.unobserve(entry.target);
}
```

- `entry.target` is the actual figure being observed, not an index into the agent array.
- `intersectionRatio` is the visible fraction of that figure. At 0.18, about 18% is visible.
- `data-revealed="true"` activates a CSS selector.
- `unobserve` makes the reveal happen only once for that mounted layout, rather than replaying every time the user scrolls back.

The SVG rises by 10 CSS pixels and returns from a slightly muted brightness/saturation to its original colours. Text never fades or gets clipped into a fixed reading window. The filters change colour treatment, not the card's opacity.

The effect returns `observer.disconnect()` for cleanup. When switching back to desktop, the mobile observer is removed before the desktop scroll controller takes over.

### 4. Reduced motion should preserve the content

Reduced-motion CSS removes the transform, filter, and transitions. It does **not** hide the four mobile sections. All headings, sentences, and cards remain available for ordinary scrolling.

Each section has a real `h2`, a matching `aria-labelledby`, and readable text. Its decorative SVG is hidden from screen readers because the title and description already supply the meaning.

### 5. The responsive boundary is behaviour, too

`App.tsx` uses `useSyncExternalStore` with a media query. It chooses mobile for narrow screens, plus small touch screens up to 1024px so common landscape phone layouts stay native.

Conditional rendering means the hidden desktop animation does not keep running on a phone. Merely applying `display: none` to it would not stop its React effect or Lenis loop.

You may still see `650svh` on `#root:empty` in the CSS. That is temporary space reserved before React mounts, to help the browser restore a reading position on reload. Once the mobile content exists, the selector no longer matches; mobile's page height comes from its actual content, not that runway.

**Try it:** lengthen one agent's `description`. The mobile section should grow and push its illustration down, with no clipped text. The desktop view should stay unchanged because it does not render that paragraph.

</details>

<details>
<summary>@file: src/App.tsx — the Lenis setup and smoothing maths explained</summary>

This setup belongs to `DesktopExperience`. The text-first mobile component uses native scrolling and does not initialize Lenis.

The actual setup is:

```ts
const lenis = new Lenis({
  eventsTarget: scene,
  autoRaf: true,
  lerp: 0.1,
  smoothWheel: true,
  syncTouch: false,
  respectReducedMotion: true,
  anchors: { immediate: true },
});
```

| Option                         | Why it is here                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `eventsTarget: scene`          | Listen for gestures on the experiment, not the separate Agentation controls                                  |
| `autoRaf: true`                | Let Lenis run its own animation-frame loop; do not add a second manual Lenis loop                            |
| `lerp: 0.1`                    | Set how quickly the current position approaches the target; smaller feels more floaty, larger more immediate |
| `smoothWheel: true`            | Smooth wheel/trackpad wheel events                                                                           |
| `syncTouch: false`             | Leave touch scrolling native instead of adding simulated touch inertia                                       |
| `respectReducedMotion: true`   | Do not apply smoothing when the user requests reduced motion                                                 |
| `anchors: { immediate: true }` | Keep the “Skip animation” link an immediate escape rather than another animated journey                      |

The wrapper remains Lenis's default, `window`. **The element listening to input and the object being scrolled are not necessarily the same thing.** Here the scene receives wheel events, but the real page scrolls.

The recommended Lenis stylesheet is imported in `index.css`. There is no transformed full-page wrapper replacing native `scrollY`, so our sticky layout and measurements still work.

### What does lerp mean without memorising a formula?

Imagine being at 0 with a target of 800. A simplified “move 10% of the remaining gap” model goes like this:

```text
First step:  0 + (800 − 0) × 0.1 = 80
Next step:  80 + (800 − 80) × 0.1 = 152
Next step: 152 + (800 − 152) × 0.1 = 216.8
```

The distance shrinks as you get closer. That is why the movement settles instead of snapping immediately.

This is a teaching model, not an exact capture of Lenis frame positions. Lenis 1.3.26 uses frame-rate-aware damping with elapsed time, so different frame rates do not simply run the same fixed-step sequence faster/slower.

Do not confuse the two calculations:

- **Lenis smoothing:** how the page approaches the user's requested scroll position.
- **Our scene interpolation:** which card positions and colours correspond to that current scroll position.

Lenis does not know about Scheduling, Onboarding, or our SVG paths.

### Why reduced-motion changes stop and restart the controller

```ts
function handleMotionChange() {
  lenis.stop();
  lenis.resize();
  lenis.start();
  measure();
}
```

The order is intentional:

1. Stop cancels any in-progress inertia.
2. Resize refreshes the controller's dimensions after CSS changes the story height.
3. Start resumes handling input, now respecting the current preference.
4. Measure refreshes our scene's progress calculation.

Testing caught why this matters. Updating dimensions alone did not stop an already-running glide; old momentum could resume when the long page returned. Cancelling the animation first fixes that root cause.

Lenis has its own frame loop. Our scene still schedules DOM updates when scroll/size events arrive. After you stop moving the input device, the scene may keep moving briefly while Lenis settles to its target; it holds its pose once the page stops.

**Try it:** change `lerp` from 0.1 to 0.15, scroll with a mouse/trackpad, then restore it. Expect less trailing motion, not a different card sequence.

</details>

<details>
<summary>@file: src/scene-motion.ts — formulas, units, and one complete worked frame</summary>

[Open the motion model](./src/scene-motion.ts).

This file does not select elements or listen to the mouse. `getSceneFrame(progress)` receives a number and returns an object of numbers/colours. The same input produces the same result, which is why reversing scroll works without a separate reverse animation.

### The coordinate conversion

```text
progress 0…1 → time 0…5 → stage + progress within that stage
```

There are six poses, which means five transitions. `time = progress * 5`. `Math.floor(time)` selects the transition's starting pose. The code caps the starting index at 4, because the final transition needs both `positions[4]` and `positions[5]`.

`clamp()` limits a value to 0…1. It prevents scrolling before/after the section from extrapolating beyond the intended start/end poses.

The `ease(start, end, value)` helper first normalises its chosen interval, then applies a smooth polynomial. Multiplication signs and repeated `t` values implement that curve; they are not separate timers. The curve maps 0 to 0, 0.5 to 0.5, and 1 to 1, with gentler starts/ends.

### Work through progress = 0.3

```text
time = 0.3 × 5 = 1.5
stage = floor(1.5) = 1
local transition position = 1.5 − 1 = 0.5
blend = 0.5
```

The two position rows are:

```text
from: [-120,    0, 0, 0]
to:   [-450, -120, 0, 0]
```

Apply `from + (to − from) × blend` to each entry:

```text
Scheduling: -120 + (-450 + 120) × 0.5 = -285
Onboarding:    0 + (-120 − 0) × 0.5   = -60
Retention:    0
Payroll:      0
```

The card focus values are approximately `[0.5, 0.5, 0, 0]`: Scheduling is dimming while Onboarding brightens. The shared marker stays pinned, and its accent is halfway between teal and yellow. Both callouts are hidden at this particular transition midpoint.

The numbers `-285` and `-60` are SVG-coordinate offsets, not CSS pixels. Focus values are fractions. Marker colour blending is also a fraction. Similar-looking numbers can have different units and jobs.

### Unpack the sticky marker formula

```ts
Math.max(1 - time, 0) - Math.max(time - agents.length, 0);
```

There are four agents. The first term supplies entry movement; the second supplies exit movement:

| time | First term | Second term | Offset             |
| ---- | ---------- | ----------- | ------------------ |
| 0.5  | 0.5        | 0           | +0.5 panel heights |
| 2.5  | 0          | 0           | 0: pinned          |
| 4.5  | 0          | 0.5         | -0.5 panel heights |

Positive means below the anchor; negative means above it. The constant zero in the middle gives the sticky phase. No hidden state machine has to remember whether the marker is currently stuck.

### A reuse pattern

Normalise an input, calculate a value, then let a different layer apply it. The same pattern can drive a progress bar's width, a camera's position, or a card's colour. You do not need to put the DOM into the maths function.

</details>

<details>
<summary>@file: src/index.css — classes, nested elements, and shared variables</summary>

[Open the stylesheet](./src/index.css).

A class connects an element to a style rule. `className="copy-panel"` in React becomes `class="copy-panel"` in the browser, and `.copy-panel { ... }` selects it in CSS. Naming the class does not create its children; the JSX nesting does that.

The desktop layout has a tall `.scroll-story`, a pinned `.scene`, and two panels. Its text track moves inside a clipped panel; the timeline is a sibling overlay. Mobile renders a separate `.mobile-experience` containing ordinary flowing sections, with no pinned scene or scroll runway.

CSS custom properties let those related elements share measurements:

```css
.copy-panel {
  --copy-top: 33.5svh;
  --marker-size: 44px;
}
```

Those are excerpts from the actual desktop rule. Children can use `var(--copy-top)` without duplicating the number, so dependent headings and marker geometry stay aligned. Mobile does not reuse that fixed text window; it has its own `.mobile-*` layout rules.

A style object such as `{ "--agent-accent": agent.accent }` passes a JavaScript value into that CSS system. The JS picks the colour; CSS decides where/how to draw it. The marker's rings are pseudo-elements: `::before` and `::after` add decorative shapes without additional semantic content.

The card palette uses `color-mix()`, not lower opacity. Both colours are solid, so the card keeps hiding the artwork behind it. The dot grid is a repeating radial gradient on `.illustration-panel`, not hundreds of extra dot elements.

React's media-query subscription chooses the mobile or desktop component. CSS then sizes that layout and handles reduced motion. This is different from merely changing a few utility classes at a breakpoint: mobile also removes the desktop controller and presents the content in a different order. For a Tailwind `md:` example, see the separate Three.js template walkthrough.

</details>

<details>
<summary>@file: src/main.tsx — why Agentation uses lazy, Suspense, and a default-export adapter</summary>

[Open the entry file](./src/main.tsx).

`createRoot(...).render(...)` mounts the React tree. `App` is the main page. Agentation is a sibling, deliberately outside the scene that Lenis listens to.

This part can look dense:

```tsx
const Agentation = import.meta.env.DEV
  ? lazy(() =>
      import("agentation").then(({ Agentation }) => ({ default: Agentation })),
    )
  : null;
```

Read it from the outside inward:

1. `import.meta.env.DEV` is Vite's development-mode flag.
2. The ternary chooses a lazy component in development, or `null` in production.
3. `lazy(...)` accepts a function that loads a component later.
4. `import("agentation")` is a dynamic import that returns a Promise.
5. `.then(...)` runs when that module arrives.
6. `({ Agentation })` takes the module's named component export.
7. `({ default: Agentation })` wraps it in the default-export shape React.lazy expects.

That last step is a tiny **adapter**: receive one shape of data and return the shape the next API needs. It does not rename the package or create a second annotation tool.

`<Suspense fallback={null}>` renders nothing while the tool loads. The app remains outside that boundary and can render immediately. `Agentation && (...)` skips the toolbar entirely when the variable is null.

The production bundler can remove this development-only import. We verify that the published build has no annotation toolbar or tool requests.

</details>

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

The outer section provides distance to scroll. The inner scene stays at the top while that distance is used. Lenis smooths wheel input over the scene by controlling the real page scroll position. Touch scrolling, the scrollbar, and keyboard navigation remain native; the scene reads the resulting `window.scrollY`.

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

`scene-motion.ts` calculates `frame.focus` from the current feature stage and its eased blend. The introduction and conclusion do not activate a card. During a handoff, one card dims while the next brightens. Card brightness is independent of the heading's opacity: the headings now stay fully opaque and move as a vertical stack.

`App.tsx` updates the card group's CSS variable:

```ts
card.style.setProperty("--card-focus", `${frame.focus[index] * 100}%`);
```

`setProperty` changes a CSS custom property. Its children inherit the palette variables, so we update four groups rather than manually recolour every path on every frame.

Only the SVG callout labels fade. Main headings physically scroll, and card colours blend without transparency. The active colour values match the source artwork exactly. Reverse scrolling reverses the colour blend too.

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

The main left-hand headings are different: they are real HTML text using locally bundled **Inria Serif**. They no longer crossfade. They sit in stacked sections and physically scroll through the left panel, always at full opacity.

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

<details>
<summary>How do the main headings scroll like page sections instead of fading?</summary>

The original version overlaid all headings in one position and changed their opacity. The current version keeps six sections in a vertical stack:

```text
.copy-panel — the visible text window
└── .copy-track — moves the entire stack
    ├── .copy-section — introduction
    ├── .copy-section — Scheduling
    ├── .copy-section — Onboarding
    ├── .copy-section — Retention
    ├── .copy-section — Payroll
    └── .copy-section — conclusion
```

Every section is one text-panel height. The track itself is also one panel high; the following sections extend below it. The panel uses `overflow: clip` to hide whatever is outside its visible area.

`App.tsx` moves the **whole track**, not the individual headings:

```ts
copyTrack.style.transform = `translateY(${-progress * (headings.length - 1) * 100}%)`;
```

There are six sections, so `headings.length - 1` is five transitions.

- At 0% scroll progress, the track is at `0%`: the introduction is in place.
- At 20%, it is at `-100%`: Scheduling occupies the same position.
- At 40%, it is at `-200%`: Onboarding is in place.
- At 100%, it is at `-500%`: the conclusion is in place.

The percentage in `translateY` refers to the track's own height, which is one text panel. Moving it by `-100%` moves exactly one section up.

Between those points, movement is proportional to scroll progress, with no easing holds or opacity changes on the text. Scroll down and the old section leaves at the top while the next enters from below. Scroll back up and the same stack moves down.

This is a scroll-driven track inside a pinned viewport, not six separate browser pages or a second independently scrollable area. Native page scrolling still supplies the progress. The right-hand illustration and its dot grid stay pinned.

This track is now desktop-only. Mobile no longer squeezes the same choreography into a short text window: it uses normal page scrolling, with a heading, sentence, and compact illustration for each agent. The desktop choreography and muted/active colour timing are unchanged.

The text uses one real `h1` and five `h2` elements rather than invisible duplicate title spans. A supporting paragraph can be added beneath a heading inside its existing section later. Reduced motion shows just the static introduction and agent summary, without moving the track.

</details>

<details>
<summary>How does one ringed marker enter, stick, and leave while changing colour?</summary>

There are four numbered eyebrows, but **only one marker**. The headings and eyebrows scroll past it; it is not replaced when the active agent changes.

| Eyebrow             | Agent      | Accent       |
| ------------------- | ---------- | ------------ |
| 01 YOUR CARERS      | Scheduling | Teal         |
| 02 YOUR TEAM        | Onboarding | Yellow       |
| 03 KEEPING THE TEAM | Retention  | Pink         |
| 04 PAYING THE TEAM  | Payroll    | Light orange |

The accent colours live on each agent's `accent` field in `scene-motion.ts`. They colour the shared marker and lower line, plus the active eyebrow number. They do not recolour the card artwork.

The structure separates the moving text from the shared indicator:

```text
.copy-panel
├── .copy-track — six scrolling text sections
└── .step-timeline — one shared indicator
    ├── .step-entry — muted upper line
    ├── .step-rail — coloured lower line
    └── .step-marker — concentric rings and centre dot
```

Why not just add `position: sticky` to the old markers? The text stack moves by a transform, not by independently scrolling its own container. Putting the indicator outside that stack lets the same scroll calculation control its position precisely.

The motion model returns this offset in units of one text-panel height:

```ts
offset: Math.max(1 - time, 0) - Math.max(time - agents.length, 0);
```

For our four agents, timeline position runs from 0 to 5:

| Timeline position | Offset | Behaviour                                            |
| ----------------- | ------ | ---------------------------------------------------- |
| 0 → 1             | +1 → 0 | Enter with Scheduling                                |
| 1 → 4             | 0      | Hold at the reading point while all four agents pass |
| 4 → 5             | 0 → -1 | Release upward with Payroll                          |

`App.tsx` turns this offset into a percentage and updates `--marker-offset`. CSS translates the whole `.step-timeline` overlay by that amount. At `0%` translation, the marker stays aligned with the eyebrow reading line; it does not move during the middle phase.

This is one continuous enter → hold → exit path, including in reverse. At both overview endpoints, the entire indicator is outside the clipped panel, so the introduction and conclusion remain clean.

Colour is separate from position. The model returns a starting accent, an ending accent, and an eased blend. CSS `color-mix()` blends those colours for the rings, centre dot, and lower line. For example, between Onboarding and Retention the marker stays still while its colour changes from yellow to pink. It does not disappear and reappear. Entry and exit blend to/from the muted blue-grey used for the overview states.

The lower line draws during entry with `--timeline-progress`, driven by `clamp(time)`, and remains drawn while pinned. It changes hue instead of restarting as four separate segments:

```css
.step-rail::after {
  transform: scaleY(var(--timeline-progress, 0));
  transform-origin: top;
}
```

The moving eyebrow numbers retain their individual agent colours and use `--step-focus` to follow their card's active/muted state. The main text remains fully opaque. There are no looping pulses or independent timers.

`--rail-x`, `--marker-size`, `--eyebrow-height`, and `--copy-top` in `index.css` control desktop alignment. Mobile keeps the agent numbers and accent colours but does not render this long rail or sticky marker. The desktop indicator is decorative and hidden from screen readers. Desktop reduced motion hides `.step-timeline` entirely and keeps the static overview.

</details>

## 5. Who does what: Lenis smooths input; our code animates the scene

These are separate jobs:

| Job                          | What this project uses        |
| ---------------------------- | ----------------------------- |
| Build the page's elements    | React                         |
| Smooth wheel input           | Lenis                         |
| Keep the section on screen   | CSS `position: sticky`        |
| Calculate and apply movement | Our TypeScript + browser APIs |

The update chain is:

```text
wheel input → Lenis smooths the real page position
    ↓
scroll event
    ↓
schedule one scene requestAnimationFrame callback
    ↓
read the latest scroll position
    ↓
getSceneFrame(progress)
    ↓
update transforms, opacity, and dash offsets
```

**`requestAnimationFrame` does not invent the animation.** It asks the browser for a good moment to apply our updates before a paint.

Once the page stops scrolling, the scene holds its pose. Lenis may keep the page gliding briefly after the input stops. Scroll backward, and the same calculation gives earlier poses; there is no separate reverse animation. Lenis owns its smoothing frame loop, while our scene updates are scheduled from scroll/size events.

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

| Approach                   | What it would provide                                              |
| -------------------------- | ------------------------------------------------------------------ |
| Current scene code + Lenis | We own the pose calculations; Lenis provides input smoothing       |
| GSAP + ScrollTrigger       | Timeline orchestration, scroll-linked scrubbing, and pinning tools |
| Motion for React           | Scroll-linked motion values and declarative animated elements      |
| SVG SMIL                   | Self-contained timed SVG animations like your original box         |

Libraries can reduce manual coordination for more complex timelines. This version uses a small shared calculation because there are only four moving cards and predictable poses.

Trade-off: our custom scene implementation still needs timing maths, measurements, cleanup, and browser tests. Adding Lenis does not replace that animation logic; it solves the separate problem of smoothing scroll input.

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

Run `npm run dev` inside this experiment at desktop width for the three timeline experiments below. Restore each change before moving to the next so you can see which setting caused which effect. For the mobile reading layout, try the description-length exercise in its file walkthrough instead.

| Try this                                         | Where                             | What to notice                                   |
| ------------------------------------------------ | --------------------------------- | ------------------------------------------------ |
| First `-120` → `-200`                            | `positions`, in `scene-motion.ts` | Scheduling rises farther; its callout follows    |
| `650svh` → `850svh`                              | `index.css`                       | Same poses, more scroll distance between them    |
| `--copy-top: 33.5svh` → `25svh` in `.copy-panel` | `index.css`                       | Desktop headings sit higher; cards are unchanged |

Then try changing **all four** `dur="4s"` values in `timed-box.svg` to `8s`. Notice how that slows the box without adding any scrolling code.

**You do not have to memorise the implementation. Learn which knob changes which behaviour.**

<details>
<summary>A small navigation map: which file do I open?</summary>

| File                                                | Why you would open it                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| [scene-motion.ts](./src/scene-motion.ts)            | Poses, movement distances, easing, callout timing, heading words      |
| [App.tsx](./src/App.tsx)                            | Shared SVG data, responsive selection, and desktop scroll scene       |
| [MobileExperience.tsx](./src/MobileExperience.tsx)  | Native scrolling sections, supporting copy, and compact illustrations |
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

**Mobile and accessibility:** phones and small touch screens get native page scrolling with all four agent sections. Each section has a real heading and explanatory sentence before its illustration. Reduced motion removes the small image reveal without hiding any mobile content. On desktop, reduced motion still replaces the pinned sequence with a static overview and agent summary, and keyboard users retain the "Skip animation" link. Decorative SVG lettering is hidden from screen readers in both layouts.

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


</details>
