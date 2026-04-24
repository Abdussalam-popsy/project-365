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
./scripts/new.sh vanilla hover-glow
./scripts/new.sh react-vite magnetic-button
./scripts/new.sh canvas particle-field
```

The script creates a dated folder, copies the template, and runs `npm install` if needed.

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

That's all the script does — just keep the `DD-name` inside `YYYY/MM/` convention.

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
