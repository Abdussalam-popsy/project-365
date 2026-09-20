# Design Interactions

A daily practice repo for frontend interactions and micro-animations.

Each interaction is a self-contained micro-project exploring a single concept — hover effects, scroll animations, canvas experiments, layout transitions, and more.

## Templates

| Template     | Stack                        | Use for                                               |
| ------------ | ---------------------------- | ----------------------------------------------------- |
| `vanilla`    | HTML + CSS + JS              | Pure CSS animations, simple DOM interactions          |
| `react-vite` | Vite + React + TS + Tailwind | Component-based interactions, state-driven animations |
| `canvas`     | HTML Canvas + JS             | Particle systems, generative art, physics simulations |

## Usage

### Create a new interaction

```bash
01 - ./scripts/new.sh react-vite signature-writer
02 - ./scripts/new.sh react-vite follow-draw
03 - ./scripts/new.sh react-vite envelope-animation
04 - ./scripts/new.sh react-vite send-a-letter
05 - ./scripts/new.sh react-vite gray-boxing
06 - ./scripts/new.sh react-vite word-map
06 - ./scripts/new.sh react-vite haven-redirection
./scripts/new.sh react-vite haven-hero
./scripts/new.sh vanilla hover-glow
./scripts/new.sh vanilla gsap-scroll
./scripts/new.sh react-vite invoice-app
./scripts/new.sh react-vite photo-journal
./scripts/new.sh react-vite magnetic-button
./scripts/new.sh canvas particle-field
  ./scripts/new.sh threejs your-exploration-name
  ./scripts/new.sh threejs cubic-shapes-wireframe
```

The script creates a dated folder, copies the template, and runs `npm install` if needed. It also copies the portable learning rule from `templates/.devin/rules/learning.md` and creates `lessons.md` from a starter when the selected template does not already contain one.

### Explain the code before committing

This is a learning repo. The always-on rule in `.devin/rules/learning.md` and the reusable [code-lessons skill](./.devin/skills/code-lessons/SKILL.md) require a current, beginner-friendly `lessons.md` before delivery and requested commits. Each meaningful source file gets an expandable `@file: ... — explained` section covering syntax, nesting, indexes, data flow, maths, and small exercises. This is an agent workflow rule, not a Git hook, and does not grant permission to commit or push.

The [Three.js starter walkthrough](./templates/threejs/lessons.md) is a complete example. New experiments inherit their own portable rule so the teaching instructions also travel with a scaffolded project.

<details>
<summary>@file: scripts/new.sh — how a starter gets its learning files</summary>

[Open the script](./scripts/new.sh).

The script receives a template name and experiment name. It checks the template exists, builds a `YYYY/MM/DD-name` path using the current date, and refuses to overwrite an existing experiment.

`REPO_ROOT` is derived from the script's location, not whichever directory the terminal happened to start in. `TEMPLATE_DIR` and `TARGET_DIR` name the source and destination. Quoting `"$TARGET_DIR"` keeps paths containing spaces together as one shell argument.

`cp -r "$TEMPLATE_DIR"/. "$TARGET_DIR"` copies the starter, including its hidden files. The script then creates `.devin/rules/` in the new directory and copies the portable learning rule into it.

The lesson guard is:

```bash
if [[ ! -f "$TARGET_DIR/lessons.md" ]]; then
  cp "$REPO_ROOT/templates/.devin/lesson-template.md" "$TARGET_DIR/lessons.md"
fi
```

`-f` asks whether a regular file exists; `!` reverses the answer. This means “use the generic lesson starter only when the selected template did not already supply a lesson.” The Three.js template's full walkthrough therefore survives scaffolding.

If the generated project has a `package.json`, the existing final step runs `npm install` inside it. `set -euo pipefail` makes failures and missing shell variables stop the script instead of silently continuing.

The starter's lesson prompts must be replaced with real explanations as the experiment is built. Copying a file named `lessons.md` is not the same as finishing the teaching work.

For script syntax checking, run `bash -n scripts/new.sh`; it checks syntax without creating an experiment or installing packages.

</details>

### Add to catalog when done

```bash
./scripts/catalog-add.sh magnetic-button "hover,react,spring" "Button that follows the cursor with spring physics"
```

Arguments: name, comma-separated tags in quotes, description in quotes.

### Create one manually

The folder structure is `YYYY/MM/DD-name`:

```
2026/
  03/
    08-magnetic-button/
      ... your files ...
```

```bash
# 1. Create the folder
mkdir -p 2026/03/08-my-thing

# 2. Copy a template into it
cp -r templates/vanilla/. 2026/03/08-my-thing/

# 3. If using react-vite, install deps
cd 2026/03/08-my-thing && npm install
```

Manual copying creates the code starter but does not add the shared learning rule or fallback lesson file. Prefer `new.sh` for that complete setup, while keeping the `DD-name` inside `YYYY/MM/` convention.

## Interactions

<!-- New interactions will be listed here -->

---

## When You Are Ready

Ideas for improving the gallery workflow — no urgency, just collected here for reference.

**Gallery:** https://abdussalam-popsy.github.io/project-365/

### Make projects appear automatically (no manual catalog.json editing)

Right now adding a project to the gallery takes two steps: create the project, then manually run `catalog-add.sh` (or hand-edit `catalog.json`). Projects built outside `new.sh` (like word-map) require even more manual work.

**The approach:**

- Each project owns a `project.json` with its metadata (name, description, tags, language)
- The CI generates `catalog.json` dynamically by scanning all `project.json` files in `2026/`
- Pushing code is all it takes — no separate catalog step

**What changes:**

1. Each project gets a `project.json` alongside its source files
2. A `scripts/generate-catalog.js` script scans `2026/**/project.json` and builds `catalog.json`
3. The CI runs `node scripts/generate-catalog.js` before building the gallery
4. `new.sh` auto-creates `project.json` when scaffolding a new project

**Side note:** If a project is missing in the gallery after pushing, try a hard refresh (Cmd+Shift+R) — GitHub Pages caches aggressively and the old version may be stuck in the browser.
