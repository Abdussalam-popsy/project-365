# SVG Animation

A scroll-linked SVG illustration of four AI agents: Scheduling, Onboarding, Retention, and Payroll. Cards lift into an upper stack while headings transition and leader lines draw toward their labels.

Built with React, TypeScript, Vite, native SVG, and locally bundled Inria Serif. Includes mobile and reduced-motion layouts.

## Run

```bash
npm ci
npm run dev
```

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
