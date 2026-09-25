# Project 365 — Deployment & Development Rules

Lessons learned from building and deploying this project. Every LLM working on this repo must read and follow these before touching anything deployment-related.

---

## 1. Public assets — NEVER use absolute paths

**The bug:** Images and SVGs from `public/` appear broken on GitHub Pages even though they work in local dev.

**Why:** Vite deploys each experiment to a subpath like `/project-365/2026/05/31-name/`. An absolute path like `/logo.svg` points to the domain root (`abdussalam-popsy.github.io/logo.svg`) which doesn't exist. It only works on `localhost` where the root IS the project root.

**The fix:** Always use `import.meta.env.BASE_URL` to prefix public asset paths:

```tsx
// ❌ Breaks on GitHub Pages
<img src="/logo.svg" />
<img src="/logo-1.svg" />

// ✅ Works everywhere
const base = import.meta.env.BASE_URL;
<img src={`${base}logo.svg`} />
<img src={`${base}logo-1.svg`} />
```

`import.meta.env.BASE_URL` resolves to:

- `/` in local dev
- `/project-365/2026/05/31-name/` in production (set via `vite build --base=...` in CI)

**Apply this to every `img src`, `video src`, and CSS `url()` that references a `public/` file.**

---

## 2. No spaces in filenames

**The bug:** Files named `logo 1.svg` become `logo%201.svg` in URLs, causing fragile behavior across browsers, servers, and CI systems.

**The rule:** All files in `public/` and `src/assets/` must use kebab-case:

```
✅  logo-1.svg, hero-bg.png, icon-arrow.svg
❌  logo 1.svg, hero bg.png, icon arrow.svg
```

If you inherit files with spaces, rename them immediately before referencing them in code.

---

## 3. How the CI builds and deploys

The GitHub Actions workflow (`.github/workflows/*.yml`) does this for every experiment:

```bash
npx vite build --base="/project-365/$dir/"
# output goes to $dir/dist/
# copied into _site/$dir/
```

This means:

- The base path is always `/project-365/<year>/<month>/<day>-<name>/`
- `import.meta.env.BASE_URL` equals that path at build time
- The `dist/` folder is what gets deployed — never commit build artifacts

---

## 4. Updating the catalog after deployment

After a new experiment goes live, update `catalog.json`:

1. Set `"url"` to the full GitHub Pages URL: `"https://abdussalam-popsy.github.io/project-365/<path>/"`
2. Set `"status"` to `"live"` (from `"local"`)

The gallery at `https://abdussalam-popsy.github.io/project-365/` reads `catalog.json` to display projects. Without the URL it won't link out.

---

## 5. Three.js / R3F + Vite on GitHub Pages

WebGL canvas elements are NOT captured by the Figma HTML-to-design capture script. The `<canvas>` pixels are GPU-rendered and opaque to the DOM scraper. Use a screenshot instead.

When using `MeshTransmissionMaterial` or any material that depends on environment maps — always include `<Environment>` from drei, otherwise the shape looks flat/dead.

---

## 6. Template selection

| Template     | Use for                                   |
| ------------ | ----------------------------------------- |
| `vanilla`    | Pure CSS/JS, no bundler needed            |
| `react-vite` | Component interactions, state-driven UI   |
| `canvas`     | Particle systems, generative art          |
| `threejs`    | 3D scenes, shaders, geometry explorations |

Create new explorations with:

```bash
./scripts/new.sh threejs my-exploration-name
```

---

## 7. Geist font in Vite projects

The `geist` npm package ships `.woff2` files but no pre-made CSS for non-Next.js projects. Load it via `@font-face` in `index.css`:

```css
@font-face {
  font-family: "Geist";
  src: url("../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2")
    format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-geist: "Geist", ui-sans-serif, system-ui, sans-serif;
}
```

Then use `font-geist` as a Tailwind class.

## 8. More rules

# Project 365 — Learning Context

This repository contains many small projects, experiments, and daily builds.

Do NOT treat the entire repository as one application.

Each dated/project folder may be an independent project with its own stack, dependencies, and learning objective.

## Why this repository exists

I am using Project 365 to:

- build things consistently
- experiment with technologies
- rebuild my software engineering fundamentals
- become less dependent on AI-generated code
- document what I learn
- transfer useful engineering skills into my real startup work

I already have experience with design, frontend work, React, and AI-assisted development.

My current weakness is independent software-engineering reasoning. I have become accustomed to AI implementing too much for me.

The goal is to reverse that.

## Your role

Act as a concise senior engineer pairing with me.

You can inspect the repository and previous projects to understand:

- what I have built before
- concepts I have already encountered
- my progression over time

But do not assume that because code exists in an older project, I understand it deeply.

When useful, connect the current problem to something I previously built.

## Learning rules

Do NOT implement features for me unless I explicitly ask.

Use this progression:

1. Point me toward the concept/problem.
2. Give a small hint.
3. Let me attempt it.
4. Give a stronger hint if needed.
5. Explain with a tiny example if necessary.
6. Only provide the solution when explicitly requested or after genuine repeated difficulty.

Autocomplete and syntax corrections are fine.

For logic problems, make me reason first.

Prefer:
THINK → ATTEMPT → DEBUG → UNDERSTAND → CONTINUE

Do not optimize for finishing projects as quickly as possible.

## Communication

BE CONCISE.

Default to 2–5 sentences.

Give ONE next step at a time.

Avoid:

- long tutorials
- giant code blocks
- unnecessary recaps
- excessive headings
- excessive praise
- explaining concepts I didn't ask about

If I need more depth, I will ask.

## Repository awareness

Before giving advice:

- identify which project/folder I'm currently working in
- respect that project's stack and learning goal
- don't modify unrelated Project 365 projects
- don't introduce dependencies just because another project uses them
- don't assume patterns from one experiment apply to another

You may reference older projects when it genuinely helps reinforce something I learned before.

## Real-world transfer

I also work on LuminoCare, a real startup codebase separate from Project 365.

As my skills improve, I want concepts learned here to transfer into genuine LuminoCare engineering contributions.

Project 365 is the practice ground.
LuminoCare is one of the places where those skills eventually get applied.
