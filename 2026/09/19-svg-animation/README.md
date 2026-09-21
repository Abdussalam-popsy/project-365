# SVG Animation

A responsive SVG exploration of four AI agents: Scheduling, Onboarding, Retention, and Payroll. On desktop, cards lift into an upper stack while full-opacity text sections scroll past one shared ringed marker. The marker enters, pins at the reading point, then exits, blending through teal, yellow, pink, and light orange. SVG leader lines draw toward their labels.

Built with React, TypeScript, Vite, native SVG, Lenis smooth scrolling, and locally bundled Inria Serif. Includes mobile and reduced-motion layouts.

Phones and small touch screens use a separate text-first layout: an introduction, then four normally scrolling sections with a heading, short sentence, and compact card illustration. There is no pinned stage or long scroll runway. A small one-time image reveal is removed for reduced motion, while all content stays available.

Lenis smooths wheel input over the desktop scene; the mobile experience uses native scrolling without initializing Lenis. The desktop skip link jumps immediately, and Agentation's controls are outside Lenis's input target. The `lerp` setting in `src/App.tsx` tunes desktop smoothing without changing the card choreography.

The active artwork is `src/assets/scene-updated.svg`, with named `payroll`, `retention`, `onboarding`, and `scheduling` groups. Keep these IDs when updating the icons. The original `scene.svg` is preserved for comparison.

## Run

```bash
npm ci
npm run dev
```

## Annotate the local preview

Agentation is enabled only when running `npm run dev`, in a desktop browser. Open its toolbar in the bottom-right corner, click an element, and add a note. Copy the generated feedback and paste it into the coding-agent chat.

This setup uses manual copy/paste, not an Agent Sync server. The toolbar is excluded from production builds and GitHub Pages.

## Verify

```bash
npm run build
npm run build -- --base=/project-365/2026/09/19-svg-animation/
npm run preview -- --base=/project-365/2026/09/19-svg-animation/
```

## What I learned

[Follow one card through the code](./lessons.md): how SVG paths become groups, what the movement columns mean, and how Scheduling and its callout react to scrolling. Includes small experiments and expandable syntax walkthroughs.

[Open the original timed-box alternative](./timed-box.svg) directly in a browser, or paste its markup into a playground. It uses native SVG animation (SMIL), with no React, GSAP, or Motion.

<!-- Notes, discoveries, techniques picked up -->

## Demo

https://abdussalam-popsy.github.io/project-365/2026/09/19-svg-animation/

<!-- Screenshot, GIF, or video link -->
