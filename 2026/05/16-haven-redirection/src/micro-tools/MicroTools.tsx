import { GridOverlay } from "./grid/GridOverlay";

/**
 * Dev-only design helpers (layout grid, gradient editor, etc.).
 * Not included in production bundles when imported behind import.meta.env.DEV.
 */
export function MicroTools() {
  if (!import.meta.env.DEV) return null;
  return <GridOverlay />;
}
