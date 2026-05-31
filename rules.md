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

| Template | Use for |
|---|---|
| `vanilla` | Pure CSS/JS, no bundler needed |
| `react-vite` | Component interactions, state-driven UI |
| `canvas` | Particle systems, generative art |
| `threejs` | 3D scenes, shaders, geometry explorations |

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
