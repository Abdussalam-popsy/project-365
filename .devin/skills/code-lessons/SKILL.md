---
name: code-lessons
description: Write and maintain beginner-friendly, expandable lessons for changed experiment or template code. Use when building features, explaining a file, changing animation maths, or preparing a commit in this learning repository.
argument-hint: "[experiment directory or source file]"
triggers:
  - user
  - model
---

# Teach how the code works, not just what it does

The user is learning to recognise reusable programming patterns. They may understand the visual result without knowing imports, JSX, callbacks, types, arrays, nesting, CSS utilities, or interpolation. Explain these patiently with real values. Do not equate unfamiliar syntax with inability.

## Work from the actual implementation

1. Read the relevant source files, imports, package scripts, and existing `lessons.md`.
2. Identify the containing experiment/template. Update its `lessons.md`; do not put unrelated lessons in an older experiment just because it was cited as an example.
3. For each meaningful changed file, provide or refresh an expandable `@file: relative/path — explained` walkthrough. Small follow-up changes should update the existing explanation rather than duplicate it.
4. Do not invent libraries, functionality, file paths, or formulas. Distinguish application code from demonstration snippets and historical versions.

## Reading structure

Start with a short mental model and links to the source files. Keep advanced material collapsed so the document remains comfortable to read on a phone.

Use this structure for a file walkthrough:

<details>
<summary>@file: src/App.tsx — explained</summary>

Link to the actual source relative to this lesson.

### What this file is responsible for

One concrete paragraph, including what lives elsewhere.

### Read the code in small pieces

For each piece, show a short accurate snippet, translate its syntax, explain the input/output, and explain why it was structured this way.

### Follow one value all the way through

Use an actual value/index from this implementation, not an abstract variable-only example.

### Predict, change, observe

Give one small reversible experiment. Put the answer in another expandable section if useful.

</details>

Do not reproduce a large application file as one wall of code. A complete short starter file can be shown when its size makes that useful. Do not add source comments just to satisfy the lesson requirement.

## What to explain

- **Imports and exports:** where each symbol comes from, default versus named imports, type-only imports, aliases, and special tooling syntax such as Vite's `?raw`.
- **Syntax:** function declarations versus arrow callbacks; implicit versus explicit returns; optional values; `?.`, `??`, `!`, ternaries, `&&`, spread, destructuring, template strings, and generics/type assertions when present. Explain only syntax actually used, unless a separate example is clearly labelled.
- **Composition and nesting:** draw a small element/component tree. Explain why X belongs inside Y, what children mean in that renderer, which props pass through, and what moving/removing a wrapper would change.
- **Indexes:** name every array's ordering. Work through one real index across mapping/reversal/pair selection. Distinguish array positions, DOM identity, React keys, and CSS classes.
- **Styling:** distinguish HTML `class`, React `className`, CSS custom properties, inline style objects, and Tailwind utility strings. If explaining `md:`, state that it is a responsive CSS condition, not a nested element. Never imply it appears in a file where it does not.
- **Maths and timing:** say where values come from and what their units are. Work through actual numbers, then explain clamping, interpolation, easing, transforms, or coordinates. Separate time-driven motion, smoothed scrolling, and scroll-progress-driven poses.
- **Lifecycle:** explain when setup runs, why refs/state/effects were chosen, what changes per frame, and why cleanup matters. Explain accessibility and reduced-motion branches as part of the implementation.
- **Alternatives:** explain one reasonable alternative and the trade-off, without suggesting the current choice is the only correct one.
- **Reuse:** show a small labelled variation where a value/component is passed into another. Trace the substitution through the result so the user can recognise the pattern next time.

## Before delivery or a requested commit

- Confirm the lesson describes the current source and libraries, not a previous version.
- Check that snippets are valid for their stated context and that links point to real files. Label partial snippets as excerpts.
- Verify numeric examples against the implementation. Check runnable demos when supplied.
- Check commands against `package.json` and repo deployment rules.
- Preserve existing useful material, but replace stale sections instead of indefinitely appending corrections.
- Ensure newly scaffolded projects do not present an unfilled lesson starter as finished teaching material.
- Include the lesson update with the source changes when a commit is requested, and tell the user where to read it.
- Never commit or push merely because this skill ran.
