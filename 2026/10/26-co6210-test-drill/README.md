# CO6210 Test Drill

> Practice for the CO6210 Design Thinking for Innovation in-class test (Weeks 1 to 3). The drill ends with **Copy results for Claude** so you can paste your misses into a chat and get feedback.

| Page | What it is |
| --- | --- |
| [drill/](./drill/) | Multiple choice: Richard's slide questions, practise all, a timed 30-question mock test, Quick 10, or your misses |
| [notes/](./notes/) | Key facts per topic, then every question with the answer hidden until you tap |

Open `index.html` directly in a browser. No build step. Your selected weeks, missed questions and light/dark choice are remembered in this browser.

From the notes, **Drill this topic →** opens the drill limited to that topic (`drill/?topic=Laws%20of%20UX`).

## Adding questions

Add a row to [`questions.js`](./questions.js); the comment at the top says what each field means. Topic names must be in `TOPIC_ORDER`. Revision facts live in [`notes/facts.js`](./notes/facts.js).

## Where it came from

Started as the "CO6210 Test Drill" Claude artifact, built from the module's lecture slides.
