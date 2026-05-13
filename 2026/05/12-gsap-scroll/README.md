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

### 5) Staggered text without SplitText (free GSAP)

- GSAP’s SplitText plugin is paid; for this repo we used a small DOM splitter:
  - Headings (`.panel-heading`) split into **characters** (`.split-char`)
  - Body copy (`.panel-body`) split into **words** (`.split-word`)
- Then we animate those spans with `stagger` on enter and exit to get the “each character/word” feel during scrub.
- Key CSS detail: spans must be **`display: inline-block`** so transforms apply per token.

### 6) “Prompting” / debugging approach that helped

- **Start with the simplest, visible debug tool**: `markers: true` on the primary ScrollTrigger.
- When something is unclear (like steps inside the scrub), add **a minimal debug layer** (extra ScrollTriggers with markers), and remove any “custom UI” that competes with the marker overlay.
- Keep everything named with **`id`** so marker labels are self-explanatory.

## Demo

<!-- Screenshot, GIF, or video link -->

## Next iterations (ideas)

- **Version 2**: try a different motion language (e.g. scale + blur, or horizontal parallax) while keeping the same panel structure.
- **Version 3**: experiment with pacing (shorter holds, longer transitions) and/or snapping to steps (labels + `snap`).
- **Debug UX**: add a single `DEBUG` flag in `script.js` to quickly toggle step markers on/off.
