/** Breakpoint: below this width uses the mobile grid spec. */
export const GRID_BREAKPOINT_PX = 768;

/** Desktop layout grid (Figma-style stretch columns). */
export const DESKTOP_GRID = {
  columns: 12,
  margin: 80,
  gutter: 20,
  maxWidth: 1280,
} as const;

/**
 * Standard mobile layout grid (4-up, 16px margin & gutter).
 * Common default for phone breakpoints in product design systems.
 */
export const MOBILE_GRID = {
  columns: 4,
  margin: 16,
  gutter: 16,
} as const;

export type GridSpec = typeof DESKTOP_GRID | typeof MOBILE_GRID;

export type ColumnRect = {
  left: number;
  width: number;
};

export type GridMetrics = {
  mode: "desktop" | "mobile";
  viewportWidth: number;
  containerWidth: number;
  containerLeft: number;
  marginLeft: number;
  marginRight: number;
  columns: ColumnRect[];
  label: string;
};

function stretchColumns(
  containerLeft: number,
  containerWidth: number,
  columnCount: number,
  gutter: number,
): ColumnRect[] {
  const trackWidth =
    (containerWidth - (columnCount - 1) * gutter) / columnCount;
  return Array.from({ length: columnCount }, (_, i) => ({
    left: containerLeft + i * (trackWidth + gutter),
    width: trackWidth,
  }));
}

export function computeGridMetrics(viewportWidth: number): GridMetrics {
  const isMobile = viewportWidth < GRID_BREAKPOINT_PX;

  if (isMobile) {
    const { columns, margin, gutter } = MOBILE_GRID;
    const containerWidth = viewportWidth - margin * 2;
    const containerLeft = margin;

    return {
      mode: "mobile",
      viewportWidth,
      containerWidth,
      containerLeft,
      marginLeft: margin,
      marginRight: margin,
      columns: stretchColumns(containerLeft, containerWidth, columns, gutter),
      label: `Mobile · ${columns} col · ${margin}px margin · ${gutter}px gutter`,
    };
  }

  const { columns, margin, gutter, maxWidth } = DESKTOP_GRID;
  const containerWidth = Math.min(maxWidth, viewportWidth - margin * 2);
  const containerLeft = (viewportWidth - containerWidth) / 2;
  const marginLeft = containerLeft;
  const marginRight = viewportWidth - containerLeft - containerWidth;

  return {
    mode: "desktop",
    viewportWidth,
    containerWidth,
    containerLeft,
    marginLeft,
    marginRight,
    columns: stretchColumns(containerLeft, containerWidth, columns, gutter),
    label: `Desktop · ${columns} col · ${margin}px margin · ${gutter}px gutter · max ${maxWidth}px`,
  };
}
