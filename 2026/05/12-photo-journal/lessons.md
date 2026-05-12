# Lessons Learned: Photo Journal Animation

This file documents the patterns and concepts used to build the photo journal animation.
Written for beginners — no assumed knowledge.

---

## 1. The Animation Sequence (State Machine)

The whole interaction is driven by a single `phase` state variable:

```
spread → converge → polaroid (with isFlipped state)
   ↑                              |
   └──────── loop ────────────────┘
```

- **spread**: 4 photos are at their positions in the horizontal strip. Static.
- **converge**: Photos animate toward the center, stacking like a deck of cards.
- **polaroid**: A single polaroid card appears, auto-flips to the letter, waits for a click.

**Lesson**: When building multi-step animations, represent each "scene" as a named state.
It makes the code readable — you can tell what's happening just by looking at the state value.

---

## 2. How the Card Stack Effect Works (No Opacity Changes!)

Each photo has a different `z-index`. The "main" photo (index 2, glasses) gets the highest z-index (4).

When all photos animate to the same X position, the higher z-index photos sit visually "on top" of the lower ones. They cover each other, so the stack looks like one photo — without any fading.

```js
const Z_ORDER = [1, 2, 4, 3]
// Index 2 (glasses) has z-index 4 → it's always on top
```

**Lesson**: You can create a "merge" illusion purely with z-index + position — no opacity needed.
Opacity fades feel cheap; physical stacking feels real.

---

## 3. Framer Motion Basics

Framer Motion is a React animation library. The core idea:

```jsx
<motion.div animate={{ x: 100 }} transition={{ duration: 0.5 }}>
```

- `animate` = where you want the element to end up
- `transition` = how it gets there (duration, easing, spring, etc.)
- When `animate` changes, framer-motion automatically animates to the new value

**`initial={false}`**: Tells framer-motion "don't animate on first render, just snap to the animate value."
Useful when you want photos to appear already spread out, not fly in from their center position.

---

## 4. Easing Curves

Easing controls the "feel" of movement — does it speed up, slow down, or bounce?

```js
ease: [0.25, 0.46, 0.45, 0.94]  // cubic-bezier: starts fast, decelerates smoothly
```

This is called `easeOutQuad`. It mimics real physics — things decelerate as they arrive.
A linear ease (no curve) looks robotic. Ease-out feels natural.

**Lesson**: Pick easing intentionally. For UI elements arriving on screen, ease-out is usually right.
For spring-based motion (like the 3D tilt), use Framer's spring config instead.

---

## 5. The 3D Card Flip

To flip a card and show a different face, you need three CSS concepts working together:

### `transform-style: preserve-3d`
Tells the browser: "my children exist in 3D space, don't flatten them."
Without this, child elements collapse into a flat plane and the flip looks broken.

### `backface-visibility: hidden`
Hides a face when it's rotated away from the camera (facing "inward").
The front face has no extra rotation. The back face has `rotateY(180deg)` pre-applied.

```
Container rotateY: 0   → front face (0deg) visible, back face (180deg) hidden
Container rotateY: 180 → front face (0+180=180deg) hidden, back face (180+180=360=0deg) visible
```

### `perspective`
Applied to the parent container. Controls how "deep" the 3D effect looks.
Think of it as the distance between your eyes and the screen.
`perspective: 1200` = subtle, realistic. `perspective: 200` = extreme, fish-eye.

---

## 6. Animating a MotionValue Directly

Instead of re-rendering the component to change an animation, you can animate a `MotionValue` directly:

```js
const flipY = useMotionValue(0)

// When isFlipped changes, animate the value with a spring
useEffect(() => {
  animate(flipY, isFlipped ? 180 : 0, {
    type: 'spring',
    stiffness: 90,
    damping: 22,
  })
}, [isFlipped])
```

This is more efficient than changing state. The DOM updates directly without a React re-render.
Use this pattern for any "smooth transition between two values" scenario.

---

## 7. The 3D Hover Tilt Trick

The hover tilt uses mouse position to calculate tiny rotation angles:

```js
// When mouse is at the left edge: rotateY = -12deg (tilts left)
// When mouse is at the right edge: rotateY = +12deg (tilts right)
const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]))
```

`useTransform` maps one range to another (mouse position → rotation degrees).
`useSpring` smooths the movement so it doesn't feel jittery.

The mouse position is normalized to -0.5 to +0.5 relative to the card:
```js
mx.set((e.clientX - rect.left) / rect.width - 0.5)
```

**Lesson**: Normalize values to a consistent range (-0.5 to 0.5 or -1 to 1) before mapping them.
It makes the math cleaner and the magic numbers more intuitive.

---

## 8. Tilt + Flip Together (Nested 3D Transforms)

The tilt and flip need to coexist without breaking each other.
The solution: nest them, with `transform-style: preserve-3d` on each layer.

```
<div perspective>                    ← camera lens
  <motion.div tiltX tiltY>           ← outer: mouse tilt (small angles)
    <motion.div rotateY=flipY>       ← inner: card flip (0 or 180deg)
      <div front-face />
      <div back-face rotateY=180 />
    </motion.div>
  </motion.div>
</div>
```

When the flip card is at 180deg AND the tilt adds 10deg, the card is actually at 190deg.
The tilt affects both faces equally, which feels natural.

---

## 9. AnimatePresence (Animate Out Before Unmounting)

React normally removes components from the DOM instantly. `AnimatePresence` lets them
play an exit animation first:

```jsx
<AnimatePresence>
  {showPolaroid && <PolaroidCard key="polaroid" ... />}
</AnimatePresence>
```

The `key` is important — it lets AnimatePresence track which component is which.
The `exit` prop on the child defines what happens before it disappears:
```jsx
exit={{ opacity: 0, scale: 0.9 }}
```

---

## 10. Managing Timers in React

Multiple async timers can conflict — timer A might fire after timer B has already changed state.
The solution: keep a single `ref` that points to the most recent timer, and cancel it before scheduling a new one.

```js
const timerRef = useRef(null)

function clearTimer() {
  if (timerRef.current) clearTimeout(timerRef.current)
}

// Always clear before scheduling
clearTimer()
timerRef.current = setTimeout(() => setPhase('converge'), 1200)
```

**Why a ref and not state?** Refs don't trigger re-renders. A timer ID isn't visual data — it's plumbing.

---

## 11. `onAnimationComplete` — Acting When an Animation Finishes

Framer Motion fires this callback when an element reaches its `animate` target:

```jsx
onAnimationComplete={
  phase === 'converge' && i === 2 ? handleConvDone : undefined
}
```

Only attach it to the "last" element (the glasses photo, index 2) to avoid firing multiple times.
The phase check `phase === 'converge'` guards against it firing during other animations.

---

## 12. Google Fonts in Vite

Add fonts via `@import` at the top of `index.css` (before any other imports):

```css
@import url('https://fonts.googleapis.com/css2?family=Gambarino&display=swap');
```

Then use the font name in CSS/JS:
```js
fontFamily: 'Gambarino, Georgia, serif'
```

The fallback (`Georgia, serif`) matters — it shows if the font fails to load.

---

## 13. The "Transitioning" Phase — Cross-Fading Between Two Elements

When two elements occupy the same position on screen (like stacked photos and a polaroid card), the naive approach is: unmount element A, then mount element B. This creates a harsh cut — a visible gap where nothing is on screen.

The fix is a **cross-fade**: briefly keep both elements alive and animate them in opposite directions at the same time.

We added a `'transitioning'` phase specifically for this overlap:

```
converge → transitioning → polaroid
             (both visible)
              strip: opacity 0→ fade out
              polaroid: opacity 0→ fade in
```

```js
// When photos finish converging:
setPhase('transitioning')         // strip stays rendered, polaroid mounts
setTimeout(() => setPhase('polaroid'), 350)  // after cross-fade, strip unmounts

// showStrip stays true during transitioning:
const showStrip = phase !== 'polaroid'

// showPolaroid becomes true during transitioning:
const showPolaroid = phase === 'polaroid' || phase === 'transitioning'
```

**Lesson**: If a transition between two elements looks harsh, the fix is almost always overlap.
Create a short "in-between" phase where both exist, animate in opposite directions, then clean up.

---

## 14. Per-Property Transition Durations

A single `motion.div` can animate multiple properties at once — and each property can have its own timing.

```js
animate={{
  x: phase === 'converge' ? CENTER_X : SPREAD_X[i],
  opacity: phase === 'transitioning' ? 0 : 1,
}}
transition={{
  x:       { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] },
  opacity: { duration: 0.3,  ease: 'easeOut' },
}}
```

Here `x` slides over 0.75s (the full converge motion) while `opacity` fades over 0.3s (a quick dissolve).
If you used one global `transition`, the opacity would also take 0.75s — far too slow for a fade.

**Lesson**: When multiple properties animate together but need different "feels", give each its own timing.
A position change and an opacity change rarely want the same duration.

---

## 15. Expanding a State Machine (Adding Phases Without Breaking Things)

This project's animation is a state machine — a finite set of named phases with defined transitions between them.

We started with 3 phases: `spread | converge | polaroid`

We added 2 more phases without rewriting anything:
- `spread-out` — reverse of converge, photos fan back outward
- `transitioning` — the brief cross-fade between photos and polaroid

The key insight: **each new phase only changes what it needs to change.** `showStrip` and `showPolaroid` are derived from phase, so adding a new phase just means deciding what those booleans should be in that phase. Existing phases are untouched.

```js
const showStrip   = phase !== 'polaroid'           // transitioning: strip still shows
const showPolaroid = phase === 'polaroid' || phase === 'transitioning'  // polaroid starts early
```

**Lesson**: State machines scale cleanly. When an animation feels wrong, the answer is usually
"add a phase between these two" rather than adding flags or timeouts on top of existing logic.

---

## Summary: Key Concepts

| Concept | What it does |
|---|---|
| `motion.div` + `animate` | Animate any CSS property declaratively |
| `initial={false}` | Skip entry animation, snap to value |
| `transform-style: preserve-3d` | Enable 3D space for children |
| `backface-visibility: hidden` | Hide a face when it's rotated away |
| `perspective` | Set 3D "depth" on a container |
| `useMotionValue` + `animate()` | Animate a value without re-rendering |
| `useSpring` + `useTransform` | Smooth, physics-based value mapping |
| `AnimatePresence` | Play exit animations before unmounting |
| `useRef` for timers | Track timeouts without triggering re-renders |
| Cross-fade phase | Keep both elements alive briefly to avoid hard cuts |
| Per-property `transition` | Give each animated property its own duration |
| Expanding state machines | Add phases between existing ones to fix transitions |
