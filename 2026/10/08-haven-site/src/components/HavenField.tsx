"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { reportHeroFrame } from "./hero/perfStats";
import { defaultHavenFieldParams, drawHavenGlow, drawHavenLines, type HavenFieldParams } from "@/lib/havenField";

const LOOP_SECONDS = 14;
const MAX_DPR = 2;
/** The glow is drawn at 1/GLOW_SCALE of CSS size and upscaled; it is blurry by design. */
const GLOW_SCALE = 8;

export function HavenField({
  className,
  params,
}: {
  className?: string;
  params?: Partial<HavenFieldParams>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const paramsRef = useRef({ ...defaultHavenFieldParams, ...params });
  paramsRef.current = { ...defaultHavenFieldParams, ...params };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const glow = document.createElement("canvas");
    const glowCtx = glow.getContext("2d");
    if (!glowCtx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let start = performance.now();
    const startPhase = paramsRef.current.phase;

    const render = (phase: number) => {
      const started = performance.now();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const params = { ...paramsRef.current, phase };
      glowCtx.setTransform(1, 0, 0, 1, 0, 0);
      glowCtx.clearRect(0, 0, glow.width, glow.height);
      drawHavenGlow(glowCtx, glow.width, glow.height, params);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(glow, 0, 0, width, height);
      drawHavenLines(ctx, width, height, params);
      reportHeroFrame({ renderMs: performance.now() - started, width: canvas.width, height: canvas.height });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      glow.width = Math.max(1, Math.round(width / GLOW_SCALE));
      glow.height = Math.max(1, Math.round(height / GLOW_SCALE));
      if (reduce) render(startPhase);
    };

    const tick = (now: number) => {
      render(startPhase + (now - start) / 1000 / LOOP_SECONDS);
      frame = requestAnimationFrame(tick);
    };

    const play = () => {
      if (reduce || !visible || document.hidden || frame) return;
      frame = requestAnimationFrame(tick);
    };
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    intersection.observe(canvas);
    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    start = performance.now();
    if (reduce) render(startPhase);
    else play();

    return () => {
      pause();
      reportHeroFrame(null);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
