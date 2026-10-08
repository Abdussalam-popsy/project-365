# Haven — marketing site

> Landing page for [Haven AI](https://usehaven.ai): AI workers for property management. Visual direction borrowed from henry.ai (editorial, light-weight display type, hairlines, product mocks), recoloured in Haven's dark purple with Inter Tight.

This folder is self-contained so it can be copied into its own client repo later.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint    # type-check
npm run build   # static export into out/
```

## Where things live

- `src/content/site.ts` — all copy (edit text here, not in components)
- `src/app/globals.css` — colour tokens (`ink`, `plum-*`, `violet`, `lilac`, `mist`)
- `src/components/` — one file per section, in page order in `src/app/page.tsx`
- `src/lib/havenField.ts` — the hero's animated signal-grid drawing (pure Canvas 2D, shared with the Toolcraft tuning app in `../08-haven-hero-tool`); `src/components/HavenField.tsx` animates it

## Exporting to the client repo

Copy this folder (minus `node_modules/`, `.next/`, `out/`, `.devin/`, `lessons.md`, `project.json`) into the new repo. `next.config.ts` uses `output: "export"` and reads `NEXT_BASE_PATH` only for the project-365 GitHub Pages preview; on Vercel leave it unset (or drop `output: "export"` if the client needs server features).

## Placeholders to replace

- Customer logos (marquee shows names / "Partner logo")
- Voice demo audio (button animates the waveform, no audio file yet)
- All `#` links and the `Book a demo` target (`DEMO_URL`)
- Wordmark in `Logo.tsx` is a stand-in, not Haven's real logo
