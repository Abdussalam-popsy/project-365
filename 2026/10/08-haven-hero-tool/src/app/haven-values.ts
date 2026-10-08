import { defaultHavenFieldParams, type HavenFieldParams } from "./haven-field";

type ValueReader = (target: string) => unknown;

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function color(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback;
}

export function readHavenFieldParams(read: ValueReader): HavenFieldParams {
  const d = defaultHavenFieldParams;
  return {
    accentColor: color(read("field.accentColor"), d.accentColor),
    glowColor: color(read("field.glowColor"), d.glowColor),
    glowIntensity: num(read("field.glowIntensity"), d.glowIntensity),
    gridDensity: num(read("field.gridDensity"), d.gridDensity),
    horizon: num(read("field.horizon"), d.horizon),
    lineColor: color(read("field.lineColor"), d.lineColor),
    lineOpacity: num(read("field.lineOpacity"), d.lineOpacity),
    phase: num(read("field.phase"), d.phase),
    signalCount: num(read("field.signalCount"), d.signalCount),
  };
}

export function readRenderScale(value: unknown): number {
  return typeof value === "number" && value > 0 ? value : 1;
}
