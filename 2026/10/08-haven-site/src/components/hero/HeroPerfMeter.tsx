"use client";

import { useEffect, useState } from "react";
import { readHeroFrame, type HeroFrameStats } from "./perfStats";

type Sample = { fps: number; avgMs: number; worstMs: number; hero: HeroFrameStats | null };

const BUDGET_MS = 1000 / 60;

function tone(fps: number) {
  if (fps >= 55) return "text-emerald-300";
  if (fps >= 40) return "text-amber-300";
  return "text-rose-400";
}

/** Measures how smoothly the whole page is animating (frame-to-frame time), sampled twice a second. */
export function HeroPerfMeter() {
  const [sample, setSample] = useState<Sample | null>(null);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let windowStart = last;
    let frames = 0;
    let worst = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      frames++;
      worst = Math.max(worst, dt);
      if (now - windowStart >= 500) {
        const elapsed = now - windowStart;
        setSample({ fps: (frames * 1000) / elapsed, avgMs: elapsed / frames, worstMs: worst, hero: readHeroFrame() });
        windowStart = now;
        frames = 0;
        worst = 0;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!sample) return null;
  const { fps, avgMs, worstMs, hero } = sample;
  const heroShare = hero ? Math.round((hero.renderMs / BUDGET_MS) * 100) : null;

  return (
    <div className="fixed right-4 bottom-16 z-50 rounded-2xl border border-white/15 bg-ink/85 px-3 py-2 font-mono text-[11px] leading-relaxed text-white/60 backdrop-blur-md">
      <div>
        <span className={`text-[13px] font-semibold ${tone(fps)}`}>{Math.round(fps)} fps</span>
        <span className="ml-2">
          {avgMs.toFixed(1)} ms avg · {worstMs.toFixed(0)} ms worst
        </span>
      </div>
      {hero && (
        <div title="JavaScript time the hero spends per frame, as a share of the 16.7 ms budget at 60fps">
          hero JS {hero.renderMs.toFixed(2)} ms ({heroShare}% of budget)
          {hero.drawCalls !== undefined && ` · ${hero.drawCalls} draws · ${Math.round((hero.triangles ?? 0) / 1000)}k tris`}
          {` · ${hero.width}×${hero.height}px`}
        </div>
      )}
    </div>
  );
}
