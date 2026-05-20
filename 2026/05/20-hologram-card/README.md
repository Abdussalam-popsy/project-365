<img width="2274" height="1358" alt="image" src="https://github.com/user-attachments/assets/b705f240-7955-40c5-b04d-fbf14e142e92" />

# Hologram Card

Small React demo with an interactive hologram card effect.

Live demo: https://joeltankard.github.io/hologram-card/

Figma layers: https://www.figma.com/community/file/1636546633442665751

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Type check

```sh
npm run typecheck
```

## Notes

Images are passed into `HologramCard` as props:

```tsx
<HologramCard
  images={{ image, depth, shade }}
  aspectRatio={5 / 6}
/>
```
