"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { reportHeroFrame } from "./hero/perfStats";
import { defaultHavenFieldParams, drawHavenField, type HavenFieldParams } from "@/lib/havenField";

const LOOP_SECONDS = 14;
const MAX_DPR = 2;

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

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let start = performance.now();
    const startPhase = paramsRef.current.phase;

    const render = (phase: number) => {
      const started = performance.now();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawHavenField(ctx, width, height, { ...paramsRef.current, phase });
      reportHeroFrame({ renderMs: performance.now() - started, width: canvas.width, height: canvas.height });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
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
