import type { CSSProperties } from "react";

export type Stop = {
  from: string;
  fromPos: number;
  to: string;
  toPos: number;
  angle: number;
};

export type GradientKey = "receive" | "sops" | "pms";
export type GradientMap = Record<GradientKey, Stop>;

export function stopToGradientStyle(stop: Stop): CSSProperties {
  return {
    background: `linear-gradient(${stop.angle}deg, ${stop.from} ${stop.fromPos}%, ${stop.to} ${stop.toPos}%)`,
  };
}
