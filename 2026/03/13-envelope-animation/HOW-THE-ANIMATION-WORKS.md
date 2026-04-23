# How the Envelope Animation Works

This document explains, in plain language, how the letter-sending animation works in `LetterComposer.tsx`. It's written so you can come back to it months from now and immediately understand what's going on.

---

## The Big Picture

Imagine you're sitting at a desk. There's a beautiful sheet of paper in front of you. You write your letter. When you press "Send", an envelope rises up from below the desk, swallows the letter, seals itself shut, gets stamped, wobbles excitedly, and flies away off-screen. Then a gentle confirmation message fades in.

That's the whole animation. Every piece of it is controlled by a single number called `step`.

---

## The Step Timeline

The animation is a sequence of 7 steps, numbered 0 through 6. Each step triggers specific visual changes. Think of it like scenes in a short film:

| Step | Name | What you see | How long |
|------|------|-------------|----------|
| **0** | Composing | Just the letter paper, centred on screen. You type here. The envelope exists but is hidden far below. | Until you press Send |
| **1** | Meeting | The envelope rises up from below while the letter slides down into it. They meet in the middle. | 1 second |
| **2** | Sealing | The envelope flap folds down to close the envelope. | 0.5 seconds |
| **3** | Stamping | A circular postmark stamp spins into view on the sealed envelope. | 0.6 seconds |
| **4** | Rocking | The sealed envelope wobbles side to side, like it's eager to go. | 0.5 seconds |
| **5** | Flying | The envelope tilts and shoots up and off the screen. | 0.65 seconds |
| **6** | Confirmation | The envelope is gone. A message appears: "Your letter is on its way." with a button to write another. | Until you click reset |

Here's the code that drives the timing. Once a step begins, it waits the specified number of milliseconds, then moves to the next step automatically:

```tsx
useEffect(() => {
  const timings: Record<number, number> = {
    1: 1000, // meeting duration
    2: 500,  // flap close duration
    3: 600,  // postmark + pause
    4: 500,  // rocking duration
    5: 650,  // fly away duration
  };
  const delay = timings[step];
  if (delay != null) {
    const t = setTimeout(() => setStep(step + 1), delay);
    return () => clearTimeout(t);
  }
}, [step]);
```

Step 0 has no timer (it waits for you to press Send). Step 6 has no timer (it waits for you to click "Write another letter"). Everything in between runs on autopilot.

---

## The Pieces of the Envelope

The envelope is built from layers stacked on top of each other, like pieces of paper on a desk. Each layer has a **z-index** number that controls which layer appears in front of which. Higher number = closer to your eyes.

```
Seen from the side (cross-section):

    You (the viewer)
         |
    [50] Postmark        — the circular date stamp (auto-updates to today's date)
    [40] Flap            — the triangular top flap
    [35] Stamp           — the small postage stamp on the envelope
    [30] Front pocket    — the V-shaped front face
    [20] Letter          — YOUR letter paper
    [10] Back            — the back panel of the envelope
```

This layering is what creates the illusion. When the letter slides down at step 1, it passes *behind* the front pocket (z:30) but stays *in front of* the back panel (z:10). So it genuinely looks like the letter is sliding into the envelope's mouth.

---

## The Two-Phase Trick (Steps 0 and 1)

This is the cleverest part of the whole animation, so let's break it down carefully.

### The problem

We want two things that seem contradictory:
1. At step 0, the letter should look like it's floating by itself in the centre of the screen — no envelope visible.
2. At step 1, the letter should slide smoothly into the envelope.

### The solution

The letter is actually *always inside* the envelope container in the code. But at step 0, two offsets cancel each other out so the letter appears to be alone:

```
Step 0 positions:
  Envelope container:  pushed 400px BELOW centre (off-screen)
  Letter (inside it):  pushed 540px ABOVE the envelope

  Net position of letter = 400 down + 540 up = 140px above centre
  → The letter appears floating on its own, roughly centred.
  → The envelope is way below the screen, invisible.
```

```
Step 1 (both move simultaneously):
  Envelope container:  rises from 400px below → to centre (0)
  Letter (inside it):  drops from 540px above → to 10px inside (tucked in)

  → They converge. The letter appears to descend while the envelope rises.
```

Here are the constants that control this:

```tsx
const ENVELOPE_OFFSCREEN_Y = 400;   // how far down the envelope hides
const LETTER_COMPOSE_Y = -540;       // how far up the letter floats (relative to envelope)
const LETTER_INSIDE_Y = 10;          // where the letter rests once inside
```

---

## Clipping: The Invisible Scissors

Clipping is the trickiest concept in this animation. It controls what parts of the letter and envelope are *visible* versus *cut off*.

Think of it like placing a picture frame over the envelope. Anything outside the frame gets hidden. The frame changes shape at different steps.

### Why we need clipping

Without clipping, when the letter slides down into the envelope at step 1, the bottom of the letter would poke out below the envelope. It would look like a piece of paper sticking out of a too-small pocket. We need to hide that overflow — but only at the right moments.

### The three clipping phases

The clipping changes across the animation in three phases:

```tsx
overflow: step >= 2 ? "hidden" : "visible",
clipPath: step === 1 ? "inset(-200% -200% 0 -200%)" : "none",
```

**Phase 1 — Step 0: No clipping at all** (`overflow: visible`, `clipPath: none`)

The letter is floating high above the envelope container. If we clipped, the letter would be invisible (it's way outside the container's boundaries). So everything is visible.

**Phase 2 — Step 1: Clip the bottom only** (`clipPath: inset(-200% -200% 0 -200%)`)

The letter is descending into the envelope. We want to hide any part of the letter that sticks out *below* the envelope, but we still need to see the letter *above* the envelope as it enters.

`clipPath: inset(top right bottom left)` works like margins that cut inward:
- `-200%` means "don't clip this side at all" (a huge negative value = no restriction)
- `0` means "clip flush with the edge"

So `inset(-200% -200% 0 -200%)` means: don't clip top, don't clip right, clip at the bottom edge, don't clip left. The letter can extend above the envelope freely, but anything below the envelope's bottom edge is hidden.

**Phase 3 — Steps 2+: Clip everything permanently** (`overflow: hidden`)

Once the letter is fully inside the envelope, clipping stays on for the rest of the animation — during the flap closing, the postmark, the rocking, *and* the fly-away. The letter never peeks out again.

You might wonder: if `overflow: hidden` is on the envelope container, how does the fly-away work? Won't the envelope get cut off as it moves? The trick is that the fly-away animation (the tilt, the upward launch) is applied to the *container itself*, not to things inside it. The container — with its clipped contents — moves as one sealed unit off the screen. Think of it like picking up a sealed box and throwing it: the box moves, but nothing falls out of it because the lid is shut.

---

## The Flap

The envelope flap is a triangle that "folds" shut using a 3D rotation. It rotates around its top edge (like a real flap being folded down).

```tsx
animate={{
  rotateX: step >= 2 ? 0 : FLAP_OPEN,  // FLAP_OPEN = 160 degrees
}}
```

At step 0-1, the flap is rotated 160 degrees — almost flat against the back, with its underside facing you. At step 2, it rotates to 0 degrees — flat and closed, sealing the envelope.

The flap has two faces, like a playing card:
- **Front face**: the lighter-coloured outside (visible when closed)
- **Back face**: the slightly darker inside (visible when open)

Both faces use `backfaceVisibility: hidden` so you only see the appropriate side at any angle. One face is flipped with `transform: rotateY(180deg)` so it shows when the other is hidden.

The flap also changes its z-index:
- When open (steps 0-1): z-index 5 — behind the letter, so the letter can pass over it
- When closed (steps 2+): z-index 40 — in front of everything except the postmark

---

## The Fly Away (Steps 4-5)

The rocking and flying are split across two different layers — and this split is important for keeping the letter hidden.

**Step 4 — Rocking** happens on an *inner wrapper* inside the envelope container:

```tsx
// Inner assembly: only handles the wobble
rotate: step === 4 ? [0, 4, -4, 3, -2, 0] : 0,
```

The `rotate` value is an array `[0, 4, -4, 3, -2, 0]`. Framer Motion treats arrays as **keyframes** — it smoothly goes through each value in sequence. So the envelope tilts right 4 degrees, then left 4, then right 3, left 2, and back to centre. This creates the wobble. Because the rocking happens *inside* the clipped container, the letter stays hidden.

**Step 5 — Flying** happens on the *outer envelope container* itself:

```tsx
// Outer container: handles the launch
y: step >= 5 ? -800 : 0,
x: step >= 5 ? 120 : 0,
rotate: step >= 5 ? 10 : 0,
```

The envelope tilts 10 degrees, moves 800 pixels up and 120 pixels to the right, and uses a special easing curve that starts slowly and accelerates — like something being launched. Because the animation is on the container (which has `overflow: hidden`), the entire sealed envelope moves as one unit. The letter can't poke out because it's clipped inside.

---

## The Confirmation Screen (Step 6)

When the step reaches 6, the entire envelope assembly is swapped out for a confirmation message using `AnimatePresence`:

```tsx
<AnimatePresence mode="wait">
  {step < 6 ? (
    /* ...the envelope and letter... */
  ) : (
    /* ...the confirmation message... */
  )}
</AnimatePresence>
```

`AnimatePresence` with `mode="wait"` means: play the exit animation of the old content *first*, then play the entrance animation of the new content. So the envelope fades out, and then the "Your letter is on its way" message fades in.

---

## Sending the Letter

There are two ways to send:

1. **Click the "Send Letter" button** at the bottom of the letter paper
2. **Press Cmd+Enter** (Mac) or **Ctrl+Enter** (Windows/Linux)

Both call the same `handleSend` function, which simply sets `step` to 1. The timer chain takes it from there.

```tsx
const handleSend = () => {
  if (!letterContent.trim() || step > 0) return;
  setStep(1);
};
```

The guard `!letterContent.trim()` prevents sending an empty letter. The guard `step > 0` prevents double-sending.

---

## Visual Summary

```
Step 0                    Step 1                  Step 2
┌─────────────┐          ┌─────────────┐         ┌─────────────┐
│             │          │     ↓       │         │  ┌───────┐  │
│  ┌───────┐  │          │  ┌───────┐  │         │  │ letter│  │
│  │ letter│  │          │  │ letter│  │         │  └───────┘  │
│  │       │  │          │  └───┬───┘  │         │  ┌═══════┐  │
│  └───────┘  │          │  ┌══╧════┐↑ │         │  │envelope│  │
│             │          │  │envelope│  │         │  │ (flap  │  │
│             │          │  └═══════┘  │         │  │ closes)│  │
│  - - - - -  │          └─────────────┘         │  └═══════┘  │
│  [envelope  │                                  └─────────────┘
│   hidden    │
│   below]    │
└─────────────┘

Step 3                    Step 4                  Step 5
┌─────────────┐          ┌─────────────┐         ┌─────────────┐
│  ┌═══════┐  │          │  ┌═══════┐  │         │             │
│  │ stamp │  │          │  │  ↔↔↔  │  │         │       ╱     │
│  │ [seal]│  │          │  │(rocks)│  │         │     ╱  ↗    │
│  │envelope│  │          │  │       │  │         │   (flies    │
│  └═══════┘  │          │  └═══════┘  │         │    away)     │
│             │          │             │         │             │
└─────────────┘          └─────────────┘         └─────────────┘

Step 6
┌─────────────┐
│             │
│  "Your      │
│   letter    │
│   is on     │
│   its way." │
│             │
│  [Write     │
│   another]  │
└─────────────┘
```

---

## Quick Reference: Key Constants

| Constant | Value | What it controls |
|----------|-------|-----------------|
| `ENVELOPE_HEIGHT` | 200px | The height of the envelope body |
| `ENVELOPE_OFFSCREEN_Y` | 400px | How far below screen centre the envelope hides at step 0 |
| `LETTER_COMPOSE_Y` | -540px | How far above the envelope the letter floats at step 0 |
| `LETTER_INSIDE_Y` | 10px | Where the letter rests inside the envelope after step 1 |
| `FLAP_OPEN` | 160 degrees | How far the flap is rotated when open |
| `softEasing` | [0.4, 0, 0.2, 1] | Smooth, natural-feeling motion curve |
| `bounceEasing` | [0.34, 1.56, 0.64, 1] | Springy curve used for the postmark stamp |

---

## Quick Reference: Layer Stack

| z-index | Layer | Role |
|---------|-------|------|
| 50 | Postmark | Circular date stamp on the sealed envelope (date updates automatically) |
| 40 | Flap (when closed) | Triangular top flap, seals the envelope |
| 35 | Stamp | Small postage stamp with envelope icon, on the envelope front |
| 30 | Front pocket | V-shaped front face of the envelope |
| 20 | Letter | The paper you write on |
| 10 | Back panel | The back wall of the envelope |
| 5 | Flap (when open) | Same flap, but behind the letter so it doesn't block it |
