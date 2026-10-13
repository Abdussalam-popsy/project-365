/**
 * Where things are in the diorama artwork, in its own pixels (1586 × 992). The day and night images are
 * pixel-aligned, so one map serves both. Overlays are drawn on a stage the exact size of the image, so
 * these numbers stay lined up at every screen size. Check changes with a marked-up copy of the artwork.
 */
export const ART = { width: 1586, height: 992 } as const;

export type Point = readonly [x: number, y: number];

/**
 * Where a house's card opens, relative to its point; picked so no card covers the hero copy or the nav.
 * "left-up" grows upward, for houses low in the frame whose card would otherwise run off the bottom.
 */
export type CardPlacement = "left" | "left-up" | "right";

export interface House {
  id: string;
  /** Centre and radius of the hover/tap area, and of the spotlight. */
  center: Point;
  radius: number;
  /** Roof peak: where the beacon sits and the card points to. */
  anchor: Point;
  windows: readonly Point[];
  placement: CardPlacement;
  /** Where the card attaches when not at the roof peak: beside the house so the card never hides it, or clear of the nav. */
  cardAt?: Point;
}

export const houses: readonly House[] = [
  { id: "corner", center: [575, 700], radius: 150, anchor: [570, 590], windows: [[483, 733], [610, 745], [665, 710], [618, 795]], placement: "right", cardAt: [725, 560] },
  { id: "gay-street", center: [935, 520], radius: 170, anchor: [935, 385], windows: [[845, 495], [965, 540], [1035, 490], [905, 595]], placement: "right", cardAt: [1095, 400] },
  { id: "gables", center: [1310, 300], radius: 150, anchor: [1290, 180], windows: [[1210, 315], [1345, 320], [1415, 300], [1360, 375], [1217, 270]], placement: "left" },
  { id: "far", center: [1510, 170], radius: 110, anchor: [1490, 90], windows: [[1560, 210], [1497, 200], [1567, 145]], placement: "left", cardAt: [1440, 215] },
  { id: "across", center: [1500, 810], radius: 130, anchor: [1530, 670], windows: [[1455, 845], [1560, 870]], placement: "left-up" },
];

/** Street lamp heads. */
export const lamps: readonly Point[] = [
  [935, 655], [1135, 522], [1355, 400], [1550, 285], [600, 832], [1085, 790], [1465, 550],
];

/** A point as a percentage of the stage, for absolutely positioned HTML. */
export const toPercent = ([x, y]: Point) => ({ left: `${(x / ART.width) * 100}%`, top: `${(y / ART.height) * 100}%` });
