// The four v5 house types and the street plan. Sizes are in world units (1 ≈ 4 m).
// Each house is built facing +z (towards the road), centred on its footprint, base at y = 0.

import type { SuburbTheme } from "./suburbTheme";

export type Prim = "box" | "gable" | "hip" | "blob";
export type Vec3 = [number, number, number];
/** One piece of a house. `pos` is the base centre; `size` is width, height, depth. */
export type Part = {
  prim: Prim;
  pos: Vec3;
  size: Vec3;
  color: string;
  yaw?: number;
  window?: { lit: boolean; flicker: number };
};
export type HouseKind = "bungalow" | "gableGarage" | "hipPorch" | "corner";
export type HouseShape = { parts: Part[]; w: number; d: number; doorX: number; driveX?: number };

export type HouseLook = {
  theme: SuburbTheme;
  wall: string;
  roof: string;
  rand: () => number;
  /** Share of windows lit, 0–1. */
  lit: number;
  warmth: number;
  flicker: number;
  focal: boolean;
  chimney: boolean;
};

const box = (pos: Vec3, size: Vec3, color: string): Part => ({ prim: "box", pos, size, color });

function pane(look: HouseLook, x: number, y: number, z: number, w = 0.34, h = 0.34): Part {
  const lit = look.focal || look.rand() < look.lit;
  const warm = look.focal || look.rand() < look.warmth;
  const flicker = !look.focal && look.rand() < look.flicker ? 0.2 + look.rand() : 0;
  return {
    prim: "box",
    pos: [x, y, z],
    size: [w, h, 0.05],
    color: warm ? look.theme.windowWarm : look.theme.windowLit,
    window: { lit, flicker },
  };
}

/** 1. Single-storey bungalow with a low hip roof. */
function bungalow(l: HouseLook): HouseShape {
  const t = l.theme;
  const parts = [
    box([0, 0, 0], [2.4, 0.95, 1.8], l.wall),
    { prim: "hip", pos: [0, 0.95, 0], size: [2.65, 0.5, 2.05], color: l.roof } as Part,
    box([0.35, 0, 0.9], [0.34, 0.64, 0.05], t.door),
    pane(l, -0.6, 0.32, 0.9, 0.5, 0.34),
    pane(l, 1.0, 0.32, 0.9),
  ];
  if (l.chimney) parts.push(box([-0.7, 0.9, -0.3], [0.2, 0.7, 0.2], t.trim));
  return { parts, w: 2.4, d: 1.8, doorX: 0.35 };
}

/** 2. Two-storey house, gable roof, garage on one side. */
function gableGarage(l: HouseLook): HouseShape {
  const t = l.theme;
  const parts = [
    box([-0.5, 0, 0], [1.8, 1.9, 1.6], l.wall),
    { prim: "gable", pos: [-0.5, 1.9, 0], size: [2.0, 0.8, 1.8], color: l.roof } as Part,
    box([0.95, 0, 0.1], [1.1, 1.0, 1.4], l.wall),
    { prim: "gable", pos: [0.95, 1.0, 0.1], size: [1.2, 0.35, 1.55], color: l.roof } as Part,
    box([0.95, 0, 0.8], [0.85, 0.78, 0.05], t.garage),
    box([-0.15, 0, 0.8], [0.3, 0.62, 0.05], t.door),
    pane(l, -0.85, 0.35, 0.8),
    pane(l, -0.95, 1.2, 0.8),
    pane(l, -0.1, 1.2, 0.8),
  ];
  if (l.chimney) parts.push(box([-1.1, 1.9, -0.35], [0.22, 0.8, 0.22], t.trim));
  return { parts, w: 3.0, d: 1.6, doorX: -0.15, driveX: 0.95 };
}

/** 3. Two-storey house, hip roof, small front porch. */
function hipPorch(l: HouseLook): HouseShape {
  const t = l.theme;
  const parts = [
    box([0, 0, 0], [2.0, 1.9, 1.7], l.wall),
    { prim: "hip", pos: [0, 1.9, 0], size: [2.25, 0.75, 1.95], color: l.roof } as Part,
    box([0, 1.0, 1.05], [1.0, 0.08, 0.5], t.trim),
    box([-0.44, 0, 1.24], [0.06, 1.0, 0.06], t.trim),
    box([0.44, 0, 1.24], [0.06, 1.0, 0.06], t.trim),
    box([0, 0, 0.85], [0.34, 0.66, 0.05], t.door),
    pane(l, -0.62, 0.35, 0.85),
    pane(l, 0.62, 0.35, 0.85),
    pane(l, -0.5, 1.2, 0.85),
    pane(l, 0.5, 1.2, 0.85),
  ];
  if (l.chimney) parts.push(box([0.55, 1.9, -0.25], [0.22, 0.95, 0.22], t.trim));
  return { parts, w: 2.0, d: 1.7, doorX: 0 };
}

/** 4. Compact corner house with an L-shaped footprint (wing towards +x). */
function corner(l: HouseLook): HouseShape {
  const t = l.theme;
  const parts = [
    box([-0.3, 0, -0.35], [1.8, 1.1, 1.3], l.wall),
    box([0.7, 0, 0], [1.0, 1.1, 2.0], l.wall),
    { prim: "gable", pos: [-0.3, 1.1, -0.35], size: [2.0, 0.6, 1.5], color: l.roof } as Part,
    { prim: "gable", pos: [0.7, 1.1, 0], size: [2.2, 0.6, 1.2], color: l.roof, yaw: Math.PI / 2 } as Part,
    box([-0.4, 0, 0.3], [0.32, 0.62, 0.05], t.door),
    pane(l, -1.0, 0.38, 0.3),
    pane(l, 0.7, 0.38, 1.0),
  ];
  if (l.chimney) parts.push(box([-0.9, 1.0, -0.6], [0.2, 0.75, 0.2], t.trim));
  return { parts, w: 2.4, d: 2.0, doorX: -0.4 };
}

export const houseKinds: Record<HouseKind, (look: HouseLook) => HouseShape> = {
  bungalow,
  gableGarage,
  hipPorch,
  corner,
};

/** A parked car, length along z, origin at its base centre. */
export function carParts(t: SuburbTheme, color: string): Part[] {
  return [
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => box([0.33 * sx, 0, 0.45 * sz], [0.1, 0.18, 0.24], t.road))),
    box([0, 0.08, 0], [0.72, 0.3, 1.45], color),
    box([0, 0.38, -0.05], [0.6, 0.24, 0.78], t.glass),
  ];
}

/** A rounded, low-poly tree. */
export function treeParts(t: SuburbTheme, color: string, scale: number): Part[] {
  return [
    box([0, 0, 0], [0.14, 0.55 * scale, 0.14], t.trunk),
    { prim: "blob", pos: [0, 0.4 * scale, 0], size: [0.95 * scale, 0.9 * scale, 0.95 * scale], color },
  ];
}

/** One plot along the street. */
export type HousePlan = {
  kind: HouseKind;
  /** -1 = left of the road (faces +x), 1 = right (faces -x). */
  side: -1 | 1;
  /** Distance along the street, before the drift moves it. */
  at: number;
  mirror: boolean;
  edge?: "hedge" | "fence";
  chimney: boolean;
  /** Brand-purple house with every window lit. */
  focal: boolean;
  car: boolean;
  /** Index into theme.walls / theme.roofs. */
  colour: number;
};

/** The street: one long road into the distance, built from repeating blocks. */
export const street = {
  roadHalf: 0.85,
  sideHalf: 0.7,
  pavement: 0.45,
  setback: 1.3,
  /** Plot width along the street. */
  plot: 3.4,
  plotsPerBlock: 4,
  blocks: 4,
  /** Where the far end of the street starts (world z). */
  far: -44,
  /** Order the house types repeat in; the shuffle comes from `seeded`. */
  kinds: ["hipPorch", "gableGarage", "bungalow", "corner", "gableGarage", "bungalow"] as HouseKind[],
};

export const blockLength = street.plot * street.plotsPerBlock;
export const streetLength = blockLength * street.blocks;

/** The same pseudo-random number for the same inputs, every time. */
export function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Every plot on both sides. In each block the first plot on one side (alternating) is
 * left empty for a side street, which makes the T-junctions.
 */
export function planStreet(): HousePlan[] {
  const plans: HousePlan[] = [];
  let i = 0;
  for (let block = 0; block < street.blocks; block++) {
    const junction = block % 2 ? 1 : -1;
    for (const side of [-1, 1] as const) {
      for (let j = 0; j < street.plotsPerBlock; j++) {
        i++;
        if (side === junction && j === 0) continue;
        const r = seeded(i, 1);
        plans.push({
          kind: street.kinds[Math.floor(seeded(i, 2) * street.kinds.length)],
          side,
          at: street.far + block * blockLength + (j + 0.5) * street.plot,
          mirror: seeded(i, 3) < 0.5,
          edge: r < 0.25 ? "hedge" : r < 0.45 ? "fence" : undefined,
          chimney: seeded(i, 4) < 0.45,
          focal: block % 2 === 0 && side !== junction && j === 2,
          car: seeded(i, 5) < 0.3,
          colour: Math.floor(seeded(i, 6) * 3),
        });
      }
    }
  }
  return plans;
}
