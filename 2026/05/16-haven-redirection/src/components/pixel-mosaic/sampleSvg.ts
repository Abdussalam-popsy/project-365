// ─── Generic SVG → pixel-grid sampler ─────────────────────────────────────────
// Rasterizes an SVG to an offscreen canvas and samples a grid of cells using
// a 5-point alpha test per cell. Works in two modes:
//
//  • Fixed bitmap  — caller specifies cols × rows × cellPx (for hero scenes)
//  • Responsive    — caller specifies container width, aspect ratio, cellPx
//    and gets back { col, row, cols, rows } so the caller can lay out the grid.
//
// Returns a Promise that resolves to a Set<number> of filled cell indices
// (index = col + row * cols) plus the grid dimensions.

const ALPHA_THRESHOLD = 100;

export interface SampleResult {
  filled: Set<number>;
  cols: number;
  rows: number;
}

/** Sample an SVG at a fixed grid size (e.g. 16×10 hero scene bitmap). */
export function sampleSvgFixed(
  url: string,
  cols: number,
  rows: number,
  cellPx: number,
): Promise<SampleResult> {
  return rasterizeAndSample(
    url,
    cols * cellPx,
    rows * cellPx,
    cols,
    rows,
    cellPx,
  );
}

/**
 * Sample an SVG at a responsive width.
 * @param url        SVG asset URL
 * @param width      Container width in CSS pixels
 * @param aspectRatio height / width of the SVG viewBox
 * @param cellPx     Pixel size of each sampled cell
 */
export function sampleSvgResponsive(
  url: string,
  width: number,
  aspectRatio: number,
  cellPx: number,
): Promise<SampleResult> {
  const height = Math.round(width * aspectRatio);
  const cols = Math.floor(width / cellPx);
  const rows = Math.floor(height / cellPx);
  return rasterizeAndSample(url, width, height, cols, rows, cellPx);
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function rasterizeAndSample(
  url: string,
  canvasW: number,
  canvasH: number,
  cols: number,
  rows: number,
  cellPx: number,
): Promise<SampleResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = canvasW;
      off.height = canvasH;
      const ctx = off.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, canvasW, canvasH);
      const { data } = ctx.getImageData(0, 0, canvasW, canvasH);

      const filled = new Set<number>();
      const H2 = cellPx >> 1;
      const H4 = cellPx >> 2;
      const H34 = H4 * 3;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellPx;
          const y = row * cellPx;
          // 5-point coverage sample — catches thin strokes and diagonal edges
          const pts: [number, number][] = [
            [x + H2, y + H2],
            [x + H4, y + H4],
            [x + H34, y + H4],
            [x + H4, y + H34],
            [x + H34, y + H34],
          ];
          for (const [px, py] of pts) {
            const sx = Math.min(px | 0, canvasW - 1);
            const sy = Math.min(py | 0, canvasH - 1);
            if (data[(sy * canvasW + sx) * 4 + 3] > ALPHA_THRESHOLD) {
              filled.add(col + row * cols);
              break;
            }
          }
        }
      }

      resolve({ filled, cols, rows });
    };
    img.src = url;
  });
}
