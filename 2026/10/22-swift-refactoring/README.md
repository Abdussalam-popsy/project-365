# Swift Refactoring

> Practice pages for the 14 refactoring techniques in Swift. Each practice page ends with **Copy results for Claude** so you can paste your misses into a chat and get feedback.

| Page | What it is |
| --- | --- |
| [drill/](./drill/) | Before/After pairs: name the technique |
| [workshop/](./workshop/) | Write the After yourself, in 3 levels |
| [cheatsheet/](./cheatsheet/) | What changed → technique name |

Open `index.html` directly in a browser. No build step.

Every page has a top bar with a light/dark toggle (your choice is remembered). The **Cheat sheet** button there (or the `?` key) opens a side panel with the cheat sheet. On the Drill and Workshop it also has a **Your answers** tab showing what you've answered this round.

## Adding a new exercise

1. Make a new folder next to `drill/` (copy `drill/index.html` as a starting point: it already loads the shared styles, the cheat sheet and the popup).
   At the end of the page's script, call `mountReferencePanel()`, or `mountReferencePanel({ history: fn })` to add a Your answers tab.
2. Add one entry to [`pages.js`](./pages.js) so it shows on the home page.

To add questions to an existing page, edit its data file: [`drill/questions.js`](./drill/questions.js), [`workshop/exercises.js`](./workshop/exercises.js), [`cheatsheet/techniques.js`](./cheatsheet/techniques.js). The comment at the top of each file says what each field means.

## Where it came from

The drill and workshop started as two Claude artifacts; the cheat sheet comes from `refactoring-spot-the-difference.xlsx`.
