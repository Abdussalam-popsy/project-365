import type { DialConfig, ResolvedValues } from "dialkit";

export const CAROUSEL_DIAL_CONFIG = {
  Camera: {
    distance: [9.5, 4, 16, 0.1] as [number, number, number, number],
    fov: [42, 28, 70, 1] as [number, number, number, number],
    parallaxX: [0.55, 0, 1.2, 0.01] as [number, number, number, number],
    parallaxY: [0.35, 0, 1.2, 0.01] as [number, number, number, number],
    hoverZoom: [0.4, 0, 1.5, 0.01] as [number, number, number, number],
  },
  Cylinder: {
    radius: [5.2, 2, 10, 0.1] as [number, number, number, number],
    cardCount: [9, 5, 16, 1] as [number, number, number, number],
    cardWidth: [1.65, 0.8, 3, 0.05] as [number, number, number, number],
    cardHeight: [2.45, 1.2, 4, 0.05] as [number, number, number, number],
    offsetX: [0, -4, 4, 0.1] as [number, number, number, number],
  },
  Scroll: {
    loops: [3, 1, 8, 0.5] as [number, number, number, number],
    heightVh: [400, 200, 800, 50] as [number, number, number, number],
    smoothness: [0.06, 0.01, 0.3, 0.01] as [number, number, number, number],
    speed: [1, 0.25, 4, 0.1] as [number, number, number, number],
  },
  Pointer: {
    tiltY: [0.12, 0, 0.3, 0.01] as [number, number, number, number],
    tiltZ: [0.06, 0, 0.2, 0.01] as [number, number, number, number],
    tiltX: [0.08, 0, 0.2, 0.01] as [number, number, number, number],
    lookAtX: [0.25, 0, 0.5, 0.01] as [number, number, number, number],
    lookAtY: [0.2, 0, 0.5, 0.01] as [number, number, number, number],
  },
  Depth: {
    backOpacity: [0.62, 0, 1, 0.01] as [number, number, number, number],
    frontOpacity: [1, 0.5, 1, 0.01] as [number, number, number, number],
    opacityFalloff: [1, 0.3, 3, 0.05] as [number, number, number, number],
    scaleMin: [0.78, 0.5, 1, 0.01] as [number, number, number, number],
  },
} satisfies DialConfig;

export type CarouselControls = ResolvedValues<typeof CAROUSEL_DIAL_CONFIG>;

export type DepthOptions = {
  scaleMin: number;
  backOpacity: number;
  frontOpacity: number;
  opacityFalloff: number;
};
