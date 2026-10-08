/** What the active hero backdrop reports about its own last frame. Read by HeroPerfMeter. */
export type HeroFrameStats = {
  /** JavaScript time spent building and submitting the frame, in ms. GPU time is not included. */
  renderMs: number;
  /** WebGL draw calls for the frame; undefined for Canvas 2D backdrops. */
  drawCalls?: number;
  triangles?: number;
  /** Backing-store size in device pixels. */
  width: number;
  height: number;
};

let latest: HeroFrameStats | null = null;

export function reportHeroFrame(stats: HeroFrameStats | null) {
  latest = stats;
}

export function readHeroFrame() {
  return latest;
}
