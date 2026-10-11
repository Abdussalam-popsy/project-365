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
  chimney: boolean;
};

const box = (pos: Vec3, size: Vec3, color: string): Part => ({ prim: "box", pos, size, color });

function pane(look: HouseLook, x: number, y: number, z: number, w = 0.34, h = 0.34): Part {
  const lit = look.rand() < look.lit;
  const warm = look.rand() < look.warmth;
  const flicker = look.rand() < look.flicker ? 0.2 + look.rand() : 0;
  return {
    prim: "box",
    pos: [x, y, z],
    size: [w, h, 0.05],
    color: warm ? look.theme.windowWarm : look.theme.windowLit,
    window: { lit, flicker },
  };
}

/** A window with a sill under it. */
function sillWindow(look: HouseLook, x: number, y: number, z: number, w = 0.34, h = 0.34): Part[] {
  return [pane(look, x, y, z, w, h), box([x, y - 0.035, z + 0.02], [w + 0.08, 0.035, 0.09], look.theme.trim)];
}

/** A front door with a frame around it and a step in front. */
function doorway(t: SuburbTheme, x: number, z: number, w: number, h: number): Part[] {
  return [
    box([x, 0, z - 0.012], [w + 0.08, h + 0.05, 0.03], t.trim),
    box([x, 0, z], [w, h, 0.05], t.door),
    box([x, 0, z + 0.1], [w + 0.22, 0.05, 0.2], t.trim),
  ];
}

/** A chimney stack with a slightly wider cap. */
function chimney(t: SuburbTheme, x: number, y: number, z: number, size: number, h: number): Part[] {
  return [box([x, y, z], [size, h, size], t.trim), box([x, y + h, z], [size + 0.06, 0.05, size + 0.06], t.trim)];
}

/** 1. Single-storey bungalow with a low hip roof. */
function bungalow(l: HouseLook): HouseShape {
  const t = l.theme;
  const parts = [
    box([0, 0, 0], [2.4, 0.95, 1.8], l.wall),
    { prim: "hip", pos: [0, 0.95, 0], size: [2.65, 0.5, 2.05], color: l.roof } as Part,
    ...doorway(t, 0.35, 0.9, 0.34, 0.64),
    ...sillWindow(l, -0.6, 0.32, 0.9, 0.5, 0.34),
    ...sillWindow(l, 1.0, 0.32, 0.9),
  ];
  if (l.chimney) parts.push(...chimney(t, -0.7, 0.9, -0.3, 0.2, 0.7));
  return { parts, w: 2.4, d: 1.8, doorX: 0.35, driveX: -1.15 };
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
    ...doorway(t, -0.15, 0.8, 0.3, 0.62),
    ...sillWindow(l, -0.85, 0.35, 0.8),
    ...sillWindow(l, -0.95, 1.2, 0.8),
    ...sillWindow(l, -0.1, 1.2, 0.8),
  ];
  if (l.chimney) parts.push(...chimney(t, -1.1, 1.9, -0.35, 0.22, 0.8));
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
    ...doorway(t, 0, 0.85, 0.34, 0.66),
    ...sillWindow(l, -0.62, 0.35, 0.85),
    ...sillWindow(l, 0.62, 0.35, 0.85),
    ...sillWindow(l, -0.5, 1.2, 0.85),
    ...sillWindow(l, 0.5, 1.2, 0.85),
  ];
  if (l.chimney) parts.push(...chimney(t, 0.55, 1.9, -0.25, 0.22, 0.95));
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
    ...doorway(t, -0.4, 0.3, 0.32, 0.62),
    ...sillWindow(l, -1.0, 0.38, 0.3),
    ...sillWindow(l, 0.7, 0.38, 1.0),
  ];
  if (l.chimney) parts.push(...chimney(t, -0.9, 1.0, -0.6, 0.2, 0.75));
  return { parts, w: 2.4, d: 2.0, doorX: -0.4 };
}

export const houseKinds: Record<HouseKind, (look: HouseLook) => HouseShape> = {
  bungalow,
  gableGarage,
  hipPorch,
  corner,
};

/** A parked car, length along z (front at +z), origin at its base centre. */
export function carParts(t: SuburbTheme, color: string): Part[] {
  const glass = (pos: Vec3, size: Vec3) => box(pos, size, t.glass);
  return [
    // Wheels
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => box([0.34 * sx, 0, 0.47 * sz], [0.1, 0.2, 0.26], t.road))),
    // Body, then a narrower cabin in the same colour with glass on all four sides
    box([0, 0.08, 0], [0.74, 0.28, 1.5], color),
    box([0, 0.36, -0.06], [0.62, 0.26, 0.8], color),
    glass([0, 0.4, 0.345], [0.54, 0.18, 0.02]),
    glass([0, 0.4, -0.465], [0.54, 0.16, 0.02]),
    ...[-1, 1].map((sx) => glass([0.315 * sx, 0.4, -0.06], [0.02, 0.17, 0.68])),
    // Headlights (front) and tail-lights (back)
    ...[-1, 1].map((sx) => box([0.24 * sx, 0.24, 0.75], [0.15, 0.06, 0.02], t.windowLit)),
    ...[-1, 1].map((sx) => box([0.26 * sx, 0.24, -0.75], [0.13, 0.06, 0.02], t.brand)),
  ];
}

/**
 * A street lamp on the pavement. `towardsRoad` is +1 or -1 (the x direction the arm reaches),
 * origin at the foot of the pole. The head glows like a lit window.
 */
export function lampParts(t: SuburbTheme, towardsRoad: 1 | -1): Part[] {
  const reach = 0.32;
  return [
    box([0, 0, 0], [0.05, 1.45, 0.05], t.trim),
    box([(towardsRoad * reach) / 2, 1.42, 0], [reach, 0.04, 0.04], t.trim),
    { prim: "box", pos: [towardsRoad * reach, 1.37, 0], size: [0.14, 0.05, 0.18], color: t.windowLit, window: { lit: true, flicker: 0 } },
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
  car: boolean;
  /** Index into theme.walls / theme.roofs. */
  colour: number;
};

/** The street: one long road into the distance, built from repeating blocks. */
export const street = {
  roadHalf: 1.15,
  sideHalf: 0.8,
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
          chimney: seeded(i, 4) < 0.6,
          car: seeded(i, 5) < 0.65,
          colour: Math.floor(seeded(i, 6) * 3),
        });
      }
    }
  }
  return plans;
}
