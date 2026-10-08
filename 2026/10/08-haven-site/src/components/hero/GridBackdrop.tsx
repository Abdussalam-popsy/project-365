"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import {
  drawHavenGrid,
  layoutHavenGrid,
  packetPath,
  pathLength,
  type GridLayout,
  type GridState,
  type Rect,
} from "@/lib/havenGrid";
import { reportHeroFrame } from "./perfStats";

const MAX_DPR = 2;
const PACKET_SPEED = 280;

/** Where the fixed header ends and where the hero copy sits, relative to the canvas. */
function measure(canvas: HTMLCanvasElement): { top: number; copy: Rect | null } {
  const base = canvas.getBoundingClientRect();
  let top = 104;
  const bars = [...document.querySelectorAll("header, nav")].map((el) => el.getBoundingClientRect());
  const fixedBottoms = bars.filter((r) => r.top < 120 && r.height > 0).map((r) => r.bottom - base.top);
  if (fixedBottoms.length) top = Math.max(...fixedBottoms);

  const rects = [...document.querySelectorAll("[data-hero-copy]")].map((el) => el.getBoundingClientRect());
  if (!rects.length) return { top, copy: null };
  const x = Math.min(...rects.map((r) => r.left)) - base.left;
  const y = Math.min(...rects.map((r) => r.top)) - base.top;
  const w = Math.max(...rects.map((r) => r.right)) - base.left - x;
  const h = Math.max(...rects.map((r) => r.bottom)) - base.top - y;
  return { top, copy: { x, y, w, h } };
}

export default function GridBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let layout: GridLayout | null = null;
    let iconCells: number[] = [];
    let dpr = 1;
    let frame = 0;
    let last = 0;
    let visible = true;
    let nextAmbient = 0.6;
    const state: GridState = {
      time: 0,
      pointer: null,
      hover: -1,
      activity: new Float32Array(0),
      packets: [],
      arrivals: [],
      resolved: 1284,
    };

    const draw = () => {
      if (!layout) return;
      const started = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawHavenGrid(ctx, layout, state);
      reportHeroFrame({ renderMs: performance.now() - started, width: canvas.width, height: canvas.height });
    };

    const relayout = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const { top, copy } = measure(canvas);
      layout = layoutHavenGrid(rect.width, rect.height, top, copy);
      state.activity = new Float32Array(layout.cols * layout.rows);
      state.packets = [];
      state.arrivals = [];
      state.hover = -1;
      iconCells = [];
      layout.icons.forEach((kind, i) => kind >= 0 && iconCells.push(i));
      draw();
    };

    const activate = (i: number) => {
      if (!layout) return;
      state.activity[i] = 1;
      if (reduce) return;
      const path = packetPath(layout, i);
      const length = pathLength(path);
      if (length > 0) state.packets.push({ path, length, progress: 0 });
    };

    const step = (dt: number) => {
      if (!reduce) {
        state.time += dt;
        nextAmbient -= dt;
        if (nextAmbient <= 0 && iconCells.length) {
          activate(iconCells[Math.floor(Math.random() * iconCells.length)]);
          nextAmbient = 0.7 + Math.random() * 1.1;
        }
      }
      for (let i = 0; i < state.activity.length; i++) {
        if (state.activity[i] > 0) state.activity[i] = Math.max(0, state.activity[i] - dt * 0.6);
      }
      state.packets = state.packets.filter((p) => {
        p.progress += (dt * PACKET_SPEED) / p.length;
        if (p.progress < 1) return true;
        const n = p.path.length;
        state.arrivals.push({ x: p.path[n - 2], y: p.path[n - 1], vertical: p.path[n - 1] === p.path[n - 3], age: 0 });
        state.resolved++;
        return false;
      });
      state.arrivals = state.arrivals.filter((a) => (a.age += dt * 1.6) < 1);
    };

    const busy = () => state.packets.length > 0 || state.arrivals.length > 0 || state.activity.some((a) => a > 0);

    const tick = (now: number) => {
      step(Math.min(0.05, (now - last) / 1000));
      last = now;
      draw();
      frame = reduce && !busy() ? 0 : requestAnimationFrame(tick);
    };
    const play = () => {
      if (!visible || document.hidden || frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // The hero copy sits above the canvas, so listen on window and hit-test cells ourselves.
    const onPointer = (e: PointerEvent) => {
      if (!layout) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { cols, rows, cell, x0, y0 } = layout;
      const { c0, c1, r0, r1 } = layout.panel;
      const c = Math.floor((x - x0) / cell);
      const r = Math.floor((y - y0) / cell);
      const onGrid = c >= 0 && c < cols && r >= 0 && r < rows && !(c >= c0 && c < c1 && r >= r0 && r < r1);
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      state.pointer = inside ? { x, y } : null;
      const i = inside && onGrid ? r * cols + c : -1;
      if (i !== state.hover && i >= 0 && layout.icons[i] >= 0 && state.activity[i] < 0.4) activate(i);
      state.hover = i;
      if (reduce) {
        draw();
        play();
      }
    };
    const onLeave = () => {
      state.pointer = null;
      state.hover = -1;
      if (reduce) draw();
    };

    const resizeObserver = new ResizeObserver(relayout);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduce) play();
      else pause();
    });
    intersection.observe(canvas);
    const onVisibility = () => (document.hidden ? pause() : !reduce && play());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    // Re-measure once the copy has finished its entrance animation and fonts have loaded.
    const settle = window.setTimeout(relayout, 1400);
    document.fonts?.ready.then(relayout);

    relayout();
    if (!reduce) play();

    return () => {
      pause();
      window.clearTimeout(settle);
      reportHeroFrame(null);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <>
      <div className="absolute inset-0 bg-ink" />
      <div className="absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(55%_70%_at_50%_0%,rgba(87,64,239,0.16),transparent)]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </>
  );
}
