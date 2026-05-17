import { GridOverlay } from "./grid/GridOverlay";
import { FPSCounter } from "./FPSCounter";

/**
 * Dev-only design helpers (layout grid, FPS monitor, etc.).
 * Not included in production bundles when imported behind import.meta.env.DEV.
 */
export function MicroTools() {
  if (!import.meta.env.DEV) return null;
  return (
    <>
      <GridOverlay />
      <FPSCounter />
    </>
  );
}
