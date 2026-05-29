import * as THREE from "three";
import type { DepthOptions } from "../config/carouselDial";

export type CylinderSlot = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
};

const DEFAULT_DEPTH: DepthOptions = {
  scaleMin: 0.78,
  backOpacity: 0.72,
  frontOpacity: 1,
  opacityFalloff: 0.85,
  sideSpread: 0.55,
  revealAngle: -0.28,
};

/** Camera-facing depth after a Y-axis yaw (camera looks down +Z). */
export function worldDepthFromYaw(x: number, z: number, yaw: number): number {
  return -x * Math.sin(yaw) + z * Math.cos(yaw);
}

export function frontnessFromYaw(
  x: number,
  z: number,
  radius: number,
  yaw: number,
): number {
  return THREE.MathUtils.clamp((worldDepthFromYaw(x, z, yaw) + radius) / (2 * radius), 0, 1);
}

export function depthOpacity(
  frontness: number,
  depth: Pick<DepthOptions, "backOpacity" | "frontOpacity" | "opacityFalloff">,
): number {
  return THREE.MathUtils.lerp(
    depth.backOpacity,
    depth.frontOpacity,
    frontness ** depth.opacityFalloff,
  );
}

export function getCylinderSlot(
  index: number,
  cardCount: number,
  radius: number,
  baseAngle: number,
  depth: DepthOptions = DEFAULT_DEPTH,
  yaw = depth.revealAngle,
): CylinderSlot {
  const angle = baseAngle + (index * (Math.PI * 2)) / cardCount;

  // Vertical arc + horizontal spread — back hemisphere sits to the sides, not only behind
  const y = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const x = Math.cos(angle) * radius * depth.sideSpread;

  const frontness = frontnessFromYaw(x, z, radius, yaw);
  const scale = THREE.MathUtils.lerp(depth.scaleMin, 1, frontness);

  return {
    position: new THREE.Vector3(x, y, z),
    rotation: new THREE.Euler(-angle, Math.atan2(x, z), 0),
    scale,
  };
}
