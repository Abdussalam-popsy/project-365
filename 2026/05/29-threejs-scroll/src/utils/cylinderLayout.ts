import * as THREE from "three";
import type { DepthOptions } from "../config/carouselDial";

export type CylinderSlot = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  opacity: number;
};

const DEFAULT_DEPTH: DepthOptions = {
  scaleMin: 0.78,
  backOpacity: 0.62,
  frontOpacity: 1,
  opacityFalloff: 1,
};

export function getCylinderSlot(
  index: number,
  cardCount: number,
  radius: number,
  baseAngle: number,
  depth: DepthOptions = DEFAULT_DEPTH,
): CylinderSlot {
  const angle = baseAngle + (index * (Math.PI * 2)) / cardCount;
  const y = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  const frontness = (z + radius) / (2 * radius);
  const scale = THREE.MathUtils.lerp(depth.scaleMin, 1, frontness);
  const opacity = THREE.MathUtils.lerp(
    depth.backOpacity,
    depth.frontOpacity,
    frontness ** depth.opacityFalloff,
  );

  return {
    position: new THREE.Vector3(0, y, z),
    rotation: new THREE.Euler(-angle, 0, 0),
    scale,
    opacity,
  };
}
