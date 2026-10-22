# Lessons from this experiment

## The idea in plain English

A small website made of plain HTML, CSS and JavaScript (no build step). The home page lists the practice pages. Each practice page lives in its own folder and has three kinds of file:

- **Data** (`questions.js`, `exercises.js`, `techniques.js`): the questions, as a JavaScript array.
- **Logic** (`drill.js`, `workshop.js`, `cheatsheet.js`): reads the data and builds the page.
- **Styles** (`drill.css` and the others): only the bits that page needs. Everything shared is in `../styles.css`.

All pages load [`shared.js`](./shared.js) first, which gives them `$`, `esc`, `highlightSwift` and `copyForClaude`.

<details>
<summary>@file: styles.css — explained</summary>

[Open the file](./styles.css).

**Colour tokens.** `:root{ --bg:#f3f4f8; ... }` defines named colours once. Everything else says `var(--bg)` instead of a hex code, so changing one token changes every page.

**Dark mode.** The block `@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){ ... } }` swaps the same token names to dark values when your Mac is in dark mode. The selector reads "the root element, unless someone forced `data-theme="light"`". The second block, `:root[data-theme="dark"]`, lets a page force dark mode.

**`[hidden]{display:none!important}`.** The JavaScript shows and hides things by setting `element.hidden = true`. Without this rule, a CSS class with `display:flex` would win and the element would stay visible. `!important` makes `hidden` always win.

**`.wrap` padding.** `padding-left:max(16px, env(safe-area-inset-left,0px))` means "16px, or more if the phone has a notch on that side".

**Cascade order.** Each page loads `styles.css` first and its own CSS second. When both set the same thing, the later file wins. That's how `workshop.css` changes `pre{line-height:1.75}` without touching the drill, which keeps 1.6.

</details>

<details>
<summary>@file: shared.js — explained</summary>

[Open the file](./shared.js).

**`const $ = id => document.getElementById(id);`** An arrow function: takes `id`, returns the element. `$("score")` is short for `document.getElementById("score")`.

**`esc(s)`** turns `<` into `&lt;` (and `&`, `>` too). Swift code like `[String: String]` is fine, but `a < b` would otherwise be read by the browser as the start of an HTML tag.

**`highlightSwift(line, types)`** walks a line with one regular expression that has four alternatives in brackets, `(comment)|(string)|(word)|(number)`. `re.exec(line)` returns the next match; `m[1]` is filled if it was a comment, `m[2]` if a string, and so on. Each match is wrapped in a `<span class="k">` (keyword), `t` (type), `c`, `s` or `n`, and those classes get their colours from `styles.css`.

Trace one value: in `let total = 2`, the loop finds `let` → `m[3]="let"` → it's in `SWIFT_KEYWORDS` → `<span class="k">let</span>` → coloured with `var(--kw)`, purple in light mode.

**`copyForClaude(text, box, status)`** tries `navigator.clipboard.writeText(text)`. That returns a Promise: `.then(success, failure)`. If the browser blocks clipboard access, `fallback` selects the text in the textarea so you can press Cmd+C yourself.

</details>

<details>
<summary>@file: theme.js + the top bar in shared.js — explained</summary>

[theme.js](./theme.js) · [shared.js](./shared.js)

**Two files, two moments.** `theme.js` is loaded in `<head>`, before any CSS paints. It reads your saved choice from `localStorage` and sets `<html data-theme="dark">`. If it ran at the end of the page like the other scripts, you'd see a flash of light mode first. The toggle button is in `shared.js`, which runs after the page exists, because a button needs the page there to attach to.

**How the colours switch.** `styles.css` already has a block for `:root[data-theme="dark"]` with dark values for every token. Setting the attribute is the whole switch: every `var(--bg)` on the page updates at once.

**`currentTheme()`** returns the attribute if you've picked one, or otherwise asks the browser `matchMedia("(prefers-color-scheme: dark)")`, i.e. your Mac's appearance. The button shows where a click takes you: the sun in dark mode, the moon in light mode.

**`try { localStorage... } catch`.** In a private window, saving can throw an error. The `catch` means the theme still switches for this visit; it just isn't remembered.

**`mountTopbar()`** builds `<div class="topbar">`, moves the page's existing `← Swift Refactoring` link into it, and adds `#topActions` on the right. [panel.js](./panel.js) then puts the Cheat sheet button at the start of `#topActions` with `insertAdjacentHTML("afterbegin", …)`, so it sits left of the theme toggle.

</details>

<details>
<summary>@file: drill/drill.js — explained</summary>

[Open the file](./drill/drill.js). Data in [drill/questions.js](./drill/questions.js).

**State lives in a few `let`s at the top:** `deck` (the shuffled questions for this round), `i` (which one you're on), `score`, `picked`, `log` (every answer, used for the report).

**`shuffle(a)`** is the Fisher–Yates shuffle. It copies the array first (`a = a.slice()`), so the original `QUESTIONS` never changes order. It walks from the end; for index `j` it picks a random `k` between 0 and `j` and swaps them with `[a[j], a[k]] = [a[k], a[j]]` (destructuring swap).

**`pool()`** picks which questions to use: `set === "10"` → shuffle all, take the first 10 with `.slice(0, 10)`; `"all"` → everything; otherwise filter by `round`.

**Diff highlighting.** `renderCode` puts every line of the *other* pane into a `Set`. A line is marked changed if it isn't in that set. Example: in the Hide method question, `    private func makeSalt() -> String {` isn't in Before, so it gets `class="ln chg"` and a blue bar.

**`buildReport()`** builds the text you paste into Claude: score, then each miss with its Before and After code, then the list you got right.

</details>

<details>
<summary>@file: workshop/workshop.js — explained</summary>

[Open the file](./workshop/workshop.js). Data in [workshop/exercises.js](./workshop/exercises.js).

**Blanks (levels 1–2).** In the data, `«private»` marks a blank. `line.split(/«([^»]*)»/)` cuts the line around each blank; because the regex has a capture group, the blank's contents are kept in the result at the odd indexes (1, 3, 5…). So `idx % 2 === 0` means "normal code, highlight it" and odd means "make an `<input>`".

`«die1 == die2|die2 == die1»` lists accepted answers separated by `|`. They're stored on the input as `data-alts` JSON, and `check()` passes if any of them matches.

**`norm(s)`** removes all whitespace (`/\s+/g`), so `die1==die2` and `die1 == die2` count as the same answer.

**Level 3 checks.** Each check is a regex run against your whole edited code with spaces removed. `mode:"not"` means it must *not* match (e.g. the old name is gone), and `mode:"count", n:2` means it must match exactly twice (the func line and the caller).

</details>

<details>
<summary>@file: cheatsheet/render.js — explained</summary>

[Open the file](./cheatsheet/render.js). Data in [cheatsheet/techniques.js](./cheatsheet/techniques.js).

This file only *builds* HTML; it doesn't put it anywhere. That's why both the full [Cheat Sheet page](./cheatsheet/cheatsheet.js) and the popup can use it: each one decides where the HTML goes.

`cheatsheetHTML()` builds one `<table>`, laid out like the spreadsheet. It loops over `GROUPS` in order and gives each group its own `<tbody class="group tone-vanished">` (a table can have several `tbody`s, one per section). Each section starts with a full-width band row (`colspan="3"`) naming the group, then one row per technique, which it gets with `.filter`. So the order on screen comes from `GROUPS`, not from the order of rows.

**Colours.** [cheatsheet.css](./cheatsheet/cheatsheet.css) sets `.tone-locked{--tone:...; --ink:...}`. Every cell inside that `tbody` reads `var(--tone)` for its background and `var(--ink)` for the band text, so one class colours a whole group. The light values are the spreadsheet's own fills, e.g. `#e3f2fd` for the "locked" blue.

**Narrow layout.** `.cs-box` has `container-type:inline-size`, and `@container (max-width:620px)` restacks the table. Unlike `@media`, it measures the *box* rather than the window. That matters because the popup is 480px wide even on a big screen: there the table stacks, while the full page beside it stays a table.

Each row stores a lowercase `data-search` string. `filterCheatsheet(root, query)` hides rows whose string doesn't `.includes()` what you typed, then hides any group left with no visible rows (`:not([hidden])`). It takes a `root` element so the popup's filter box only filters the popup, not some other copy of the sheet.

</details>

<details>
<summary>@file: panel.js — explained</summary>

[Open the file](./panel.js). Styles in [panel.css](./panel.css).

**The button.** It lives in the top bar (see the theme section above), not floating over the page.

**Why a `<dialog>`.** `dialog.showModal()` gives you a popup that sits on top of everything, dims the page behind it (the `::backdrop`), traps Tab inside, and closes on Esc, all built into the browser. `panel.css` sets `margin:0 0 0 auto` so it's pinned to the right edge instead of centred.

**Closing on the dim area.** Clicking the backdrop fires a click whose `e.target` is the dialog element itself; clicking anything inside has a child as the target. So `if(e.target === dialog) dialog.close()` means "clicked outside the content".

**The `?` shortcut.** `e.target.closest("input, textarea, [contenteditable]")` checks whether you're typing somewhere. If you are, `?` is just a character you want in your answer, so it's ignored.

**"Your answers" is a function, not a list.** The page passes `history: answerHistory`, a function. The panel calls it every time it opens, so it always reflects the latest `log`. If it were passed a list once, it would stay frozen at whatever was answered when the page loaded (nothing).

Trace one value: in the Drill you pick *Inline temp* for a *Remove parameter* question → `check()` pushes `{q, picked:"Inline temp", ok:false}` onto `log` → you press `?` → `open()` calls `answerHistory()` → that maps the log to `<details class="ans bad">` items, `.reverse()`s them so the newest is first, and the latest gets `open` so it's already expanded.

**Workshop answers.** `typedAnswer(e)` rebuilds your attempt by replacing each `«…»` blank in `e.after` with what you typed, in order (`typed[n++]`). `reveal()` saves it *before* filling the blanks with the right answers, otherwise "Your answer" would show the model answer.

</details>

<details>
<summary>Try one small change</summary>

In [pages.js](./pages.js), change the Drill's `kind: "Practice"` to `kind: "Quiz"` and reload the home page.

**Predict:** what changes on screen?

**Answer:** only the small grey label at the top of the Drill card. The home page builds its cards from `PAGES`, so the data is the only thing to edit. Change it back to `"Practice"` to restore it.

</details>

## Run and check

Open `index.html` in a browser (double-click it, or `npx serve .` from this folder). Check:

- the home page shows three cards and each one opens;
- in the Drill, pick an answer, Check, then finish a round and press **Copy results for Claude**;
- in the Workshop, fill a blank wrongly and see it turn red;
- in the Cheat Sheet, type `private(set)` in the filter box and only three rows stay.
- on the Drill or Workshop, answer two questions, press `?`, open **Your answers**: the newest is at the top and expanded.
