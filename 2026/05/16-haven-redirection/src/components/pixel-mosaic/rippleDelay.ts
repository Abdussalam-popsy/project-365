/**
 * Returns the ripple transition delay (in ms) for a tile at (col, row).
 * Tiles closest to the center of the grid animate first; outer rings follow.
 * This creates the expanding "bloom" or "ripple" effect.
 */
export function rippleDelayMs(
  col: number,
  row: number,
  centerCol: number,
  centerRow: number,
  msPerUnit: number,
): number {
  return (
    Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2) * msPerUnit
  );
}
