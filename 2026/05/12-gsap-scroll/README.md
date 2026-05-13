# GSAP scroll lab

Pinned scrub timeline with panel crossfades (Version 1).

## Pages

Open **`index.html`** for the overview, or jump straight to:

- **`version1.html`** — main demo (`script.js`)
- **`version2.html`** / **`version3.html`** — placeholders for alternate experiments

Each version is a separate file so only one ScrollTrigger setup runs at a time.

### GSAP markers

With `markers: true`, overlapping labels at the same scroll position (e.g. `scroller-start` and `start`) are normal — they are layers from **one** trigger, not multiple versions.

## What I learned

### 1) ScrollTrigger markers are per-trigger (not per “moment”)

- **Markers show the start/end of a ScrollTrigger**, not the “beats” inside a scrubbed timeline.
- If you want to see markers for **Step 1 / Step 2 / Step 3** inside one pinned scrub, you add **extra debug-only** `ScrollTrigger.create({ markers: true })` instances that map **timeline progress/time → scroll positions**.

### 2) Why marker labels sometimes “cluster”

- Near the top/bottom of the page it’s normal to see text like `scroller-start`, `start`, and the trigger `id` overlap.
- That overlap is **not multiple versions**. It’s multiple marker labels landing on the same pixel because they’re tied to the same scroll position.
- To keep things readable, you can use **`markers: { indent: ... }`** on the debug-only step markers.

### 3) One page per version keeps experiments clean

- Putting multiple ScrollTriggers/timelines into one page can make debugging confusing (markers stack, multiple pins can fight).
- Splitting into **`version1.html`**, **`version2.html`**, **`version3.html`** keeps each experiment isolated while sharing the same top nav and CSS.

### 4) Scrubbed timeline = “scroll is the playhead”

- Version 1 is built as a single `gsap.timeline({ scrollTrigger: { pin, scrub } })`.
- That means **scroll position directly controls timeline progress**, which is great for studying timing because you can stop anywhere and inspect state.

### 5) Staggered text without SplitText

- At the time of V1, SplitText was a paid GSAP Club plugin, so we used a small manual DOM splitter:
  - Headings (`.panel-heading`) split into **characters** (`.split-char`)
  - Body copy (`.panel-body`) split into **words** (`.split-word`)
- Then we animate those spans with `stagger` on enter and exit to get the “each character/word” feel during scrub.
- Key CSS detail: spans must be **`display: inline-block`** so transforms apply per token.
- **Update (GSAP 3.12+):** SplitText is now free. See V2 for how to use it properly via CDN.

### 6) “Prompting” / debugging approach that helped

- **Start with the simplest, visible debug tool**: `markers: true` on the primary ScrollTrigger.
- When something is unclear (like steps inside the scrub), add **a minimal debug layer** (extra ScrollTriggers with markers), and remove any “custom UI” that competes with the marker overlay.
- Keep everything named with **`id`** so marker labels are self-explanatory.

## Demo

<!-- Screenshot, GIF, or video link -->

---

## Version 2 — Dealing Cards + Highlight Text on Scroll

**Files:** `version2.html`, `script-v2.js`

**What it does:**
- Intro quote fades in character-by-character as you scroll through it (SplitText highlight effect)
- Pinned section where three cards are stacked off-screen below the viewport and "dealt" one at a time into a fanned layout as you scroll
- Outro quote has the same highlight effect on the way out

---

### What I learned in V2

#### 1) SplitText is free now (GSAP 3.12+)

- SplitText, MorphSVG, and other GSAP "Club" plugins are now free as of GSAP 3.12.
- **cdnjs does not have them.** Use the jsDelivr npm mirror:
  ```
  https://cdn.jsdelivr.net/npm/gsap@3.15/dist/SplitText.min.js
  ```
- If the script 404s, `SplitText` is `undefined`. Calling `gsap.registerPlugin(SplitText)` with `undefined` throws and **kills all JS on the page** — including unrelated animations. Always verify the CDN URL works before assuming it's a code bug.

#### 2) CSS color is the "lit" state — GSAP `autoAlpha` controls the dim state

- The highlight effect works by animating `autoAlpha` (opacity) `from` a low value to `1` on each character.
- **The CSS `color` must be the fully-lit state** (e.g. `color: #fff`). GSAP dims from there.
- Trap: if you set `color: rgba(255,255,255,0.18)` in CSS thinking it's the "unlit" look, the lit endpoint is still that dim colour at full opacity. The animation plays but nothing visibly changes. Keep CSS at full brightness and let GSAP handle the fade.

#### 3) `getAttribute` returns strings — always `parseFloat` numeric data attributes

- `heading.getAttribute("data-highlight-fade")` returns `"0.18"` (a string).
- `"0.18" || 0.18` evaluates to `"0.18"` — the fallback never runs, and GSAP receives a string opacity.
- Fix: `parseFloat(heading.getAttribute("data-highlight-fade")) || 0.18`

#### 4) ScrollTrigger fires immediately if the element is already in the viewport on load

- `start: "top 90%"` means "fire when the element's top edge reaches 90% down the viewport." If the element is already above that line when the page loads, the trigger fires instantly — no animation plays.
- To get the reveal-on-scroll feel, **push the text off-screen before the fold**:
  - Make the section taller than the viewport (`min-height: 150vh`)
  - Use `align-items: flex-end` so the text sits at the bottom of that tall section
  - On page load the user sees an empty dark screen; the text is below the fold and enters view as they scroll
- Also widen the scroll range (`end: "bottom 20%"`) so the animation plays over more scroll distance, not just a tiny window.

#### 5) SplitText `onSplit` + `gsap.context()` — the correct modern pattern

```js
new SplitText(heading, {
  type: "words, chars",
  autoSplit: true,         // re-splits automatically on resize
  onSplit(self) {
    const ctx = gsap.context(() => {
      // build ScrollTrigger timeline here
    });
    return ctx;            // return ctx so GSAP can clean up on re-split
  },
});
```
- `autoSplit: true` re-fires `onSplit` whenever the element resizes (e.g. window resize changes line breaks).
- Returning `ctx` from `onSplit` tells GSAP to kill the previous animations before creating new ones — prevents stacked duplicate triggers.
- The `trigger` inside should reference `heading`, not `self.chars`, so the scroll position stays tied to the original element bounds.

#### 6) Dealing cards — positioning and the coordinate maths

The cards are stacked in a hidden "queue" below the viewport using CSS custom properties:

```css
.pin-section.v2-pin {
  --v2-col-first: 65vh;   /* centre-Y of card 1 relative to pin section */
  --v2-card-h: 500px;
  --v2-card-gap: 56px;
}

.v2-card-1 { --rest-y: var(--v2-col-first); }
.v2-card-2 { --rest-y: calc(var(--v2-col-first) + var(--v2-card-h) + var(--v2-card-gap)); }
.v2-card-3 { --rest-y: calc(var(--v2-col-first) + 2 * (var(--v2-card-h) + var(--v2-card-gap))); }
```

Each card is `position: absolute; top: calc(50% + var(--rest-y)); transform: translate(-50%, -50%)` — centred horizontally, queued vertically below 50% of the pin section height.

The GSAP animation then computes the exact `y` delta needed to move each card from its queue position to the fan:

```js
function getStartCenterY(cardSelector) {
  const pin = document.querySelector(".v2-pin");
  const card = document.querySelector(cardSelector);
  const pinTop = pin.getBoundingClientRect().top;
  const cardRect = card.getBoundingClientRect();
  return cardRect.top - pinTop + cardRect.height / 2;
  // = card centre in viewport coords, relative to pin section top
}

// In buildDeal():
y: fanY - getStartCenterY(".v2-card-1")
// fanY = where we want the fan centre to land (fraction of vh)
// subtracting the card's current centre gives the exact translation needed
```

This is viewport-size-safe: it measures actual rendered positions, not assumed pixel values.

#### 7) `gsap.matchMedia()` for responsive animations

- Use `gsap.matchMedia()` instead of a plain `window.matchMedia` listener.
- `mm.add(query, callback)` creates a context that **automatically kills** and re-creates the timeline when the breakpoint changes.
- The callback receives `isNarrow` via the query, letting you pass different fan widths:
  ```js
  mm.add("(max-width: 760px)", () => createDealingTimeline(true));
  mm.add("(min-width: 761px)", () => createDealingTimeline(false));
  ```

#### 8) `document.fonts.ready` → `ScrollTrigger.refresh()`

- Custom fonts load after the initial layout pass. If GSAP measures element heights before fonts render, all position calculations are off.
- Fix: `document.fonts.ready.then(() => ScrollTrigger.refresh())` — recalculates all trigger positions once the correct font metrics are in place.

#### 9) `scrub: 1` vs `scrub: true`

- `scrub: true` = instant follow (playhead jumps straight to scroll position).
- `scrub: 1` = 1 second of lag (playhead eases toward scroll position, feels more organic).
- For the dealing cards effect, `scrub: 1` makes the cards feel like they're physically being dealt rather than snapping.

#### 10) Design detail — card text colour should match the background, not be pure white

- Figma design used `#f9f5e9` (the same cream as the section background) for card text, not `#ffffff`.
- This creates a subtle warmth — text doesn't feel harsh against the bold card colours.
- Match your text to the page background colour when placing text on vivid cards.

---

## Next iterations (ideas)

- **Version 3**: experiment with pacing (shorter holds, longer transitions) and/or snapping to steps (labels + `snap`).
- **Debug UX**: add a single `DEBUG` flag in `script.js` to quickly toggle step markers on/off.
