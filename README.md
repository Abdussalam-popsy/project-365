# Design Interactions

A daily practice repo for frontend interactions and micro-animations.

Each interaction is a self-contained micro-project exploring a single concept — hover effects, scroll animations, canvas experiments, layout transitions, and more.

## Templates

| Template | Stack | Use for |
|----------|-------|---------|
| `vanilla` | HTML + CSS + JS | Pure CSS animations, simple DOM interactions |
| `react-vite` | Vite + React + TS + Tailwind | Component-based interactions, state-driven animations |
| `canvas` | HTML Canvas + JS | Particle systems, generative art, physics simulations |
| `next` | Next.js + React + TS + Tailwind | Page transitions, SSR interactions, routing animations |

## Usage

### Create a new interaction

```bash
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

## Adding new templates

Drop a folder into `templates/` and it's instantly available. The `new.sh` script picks up any folder name automatically — no config changes needed.

```bash
# Example: add a Three.js template
mkdir templates/threejs
# Add your starter files...
# Then use it like any other
./scripts/new.sh threejs rotating-cube
```

## Interactions

<!-- New interactions will be listed here -->
