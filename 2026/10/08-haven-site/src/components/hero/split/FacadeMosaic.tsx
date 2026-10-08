"use client";

import { useEffect, useRef } from "react";
import { hash } from "@/lib/havenGrid";

const BLOCK_ROWS = 4;
const TARGET_BLOCKS = 7;

/** A lit apartment facade with solid lilac blocks that blink on and off over it. Hovering lights the block under the pointer. */
export function FacadeMosaic({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let frame = 0;
    let visible = true;
    let lastToggle = 0;
    let lastFlicker = -1;
    const blocks = new Set<number>([1, 6, 9, 14, 20, 23]);
    const cols = () => Math.ceil(w / (h / BLOCK_ROWS));

    const draw = (time: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#2a1a6e");
      bg.addColorStop(1, "#120a3a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Window grid, tilted slightly so it reads like a photo rather than a pattern.
      ctx.save();
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(-0.08);
      const ww = Math.max(6, h / 9);
      const step = ww * 1.55;
      const tick = Math.floor(time * 1.5);
      for (let gx = -12; gx <= 12; gx++) {
        for (let gy = -6; gy <= 6; gy++) {
          const lit = hash(gx, gy, 1) < 0.42 !== (hash(gx, gy, tick) < 0.025);
          const warm = hash(gx, gy, 2) < 0.18;
          ctx.fillStyle = lit ? (warm ? "rgba(255,214,150,0.85)" : "rgba(201,193,255,0.7)") : "rgba(11,6,42,0.65)";
          ctx.fillRect(gx * step - ww / 2, gy * step - ww * 0.7, ww, ww * 1.4);
        }
      }
      ctx.restore();
      const shade = ctx.createLinearGradient(0, 0, 0, h);
      shade.addColorStop(0, "rgba(15,8,51,0)");
      shade.addColorStop(1, "rgba(15,8,51,0.55)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, w, h);

      const bs = h / BLOCK_ROWS;
      const c = cols();
      ctx.fillStyle = "#c9c1ff";
      for (const i of blocks) ctx.fillRect((i % c) * bs, Math.floor(i / c) * bs, bs, bs);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw(performance.now() / 1000);
    };

    const tick = (now: number) => {
      const t = now / 1000;
      let dirty = Math.floor(t * 1.5) !== lastFlicker;
      lastFlicker = Math.floor(t * 1.5);
      if (now - lastToggle > 380) {
        lastToggle = now;
        const total = cols() * BLOCK_ROWS;
        if (blocks.size > TARGET_BLOCKS || (blocks.size > 3 && Math.random() < 0.45)) {
          const list = [...blocks];
          blocks.delete(list[Math.floor(Math.random() * list.length)]);
        } else blocks.add(Math.floor(Math.random() * total));
        dirty = true;
      }
      if (dirty) draw(t);
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

    const cell = canvas.parentElement;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const bs = h / BLOCK_ROWS;
      const i = Math.floor((e.clientY - r.top) / bs) * cols() + Math.floor((e.clientX - r.left) / bs);
      if (!blocks.has(i)) {
        blocks.add(i);
        draw(performance.now() / 1000);
      }
    };
    cell?.addEventListener("pointermove", onMove);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => ((visible = e.isIntersecting) ? play() : pause()));
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    play();
    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      cell?.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />;
}
