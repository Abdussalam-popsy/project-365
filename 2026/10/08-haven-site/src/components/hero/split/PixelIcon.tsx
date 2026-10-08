"use client";

import { useEffect, useRef } from "react";
import { HAVEN_ICONS, type HavenIconName } from "@/lib/havenIcons";
import { hash } from "@/lib/havenGrid";

export type PixelIconSpec = { icon: HavenIconName; color: string };

const SIZE = 112;
const ICON = 52;
const STEP_MS = 110;
/** Materialise: coarse blocks (half revealed, then all), finer blocks, then the crisp stroke. Dissolve plays it backwards. */
const IN_STEPS = [
  { n: 4, reveal: 0.5 },
  { n: 4, reveal: 1 },
  { n: 8, reveal: 1 },
  { n: 16, reveal: 1 },
  { n: 0, reveal: 1 },
];

type Stage = "in" | "hold" | "out" | "gap";

/** Cycles through icons inside a cell, assembling each one out of pixel blocks. Hovering the cell skips to the next. */
export function PixelIcon({ icons, delay = 0, reduce }: { icons: PixelIconSpec[]; delay?: number; reduce: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;

    const sprites = new Map<number, HTMLCanvasElement>();
    const masks = new Map<string, Uint8Array>();
    const sprite = (k: number) => {
      let c = sprites.get(k);
      if (!c) {
        c = document.createElement("canvas");
        c.width = c.height = ICON * dpr;
        const g = c.getContext("2d")!;
        const s = (ICON * dpr) / 24;
        g.scale(s, s);
        g.lineWidth = 1.5;
        g.lineCap = "round";
        g.lineJoin = "round";
        g.strokeStyle = icons[k].color;
        g.stroke(new Path2D(HAVEN_ICONS[icons[k].icon]));
        sprites.set(k, c);
      }
      return c;
    };
    // Downsample the crisp icon to n×n and keep the cells with enough ink: that is the block version.
    const mask = (k: number, n: number) => {
      const key = `${k}:${n}`;
      let m = masks.get(key);
      if (!m) {
        const t = document.createElement("canvas");
        t.width = t.height = n;
        const g = t.getContext("2d", { willReadFrequently: true })!;
        g.drawImage(sprite(k), 0, 0, n, n);
        const data = g.getImageData(0, 0, n, n).data;
        m = new Uint8Array(n * n);
        for (let i = 0; i < n * n; i++) m[i] = data[i * 4 + 3] > 34 ? 1 : 0;
        masks.set(key, m);
      }
      return m;
    };

    let current = 0;
    let stage: Stage = reduce ? "hold" : "gap";
    let stageStart = performance.now() + delay * 1000;
    let hold = 2600 + Math.random() * 2200;
    let lastKey = "";
    let frame = 0;
    let visible = true;

    const draw = (step: { n: number; reveal: number } | null, cycle: number) => {
      const key = step ? `${current}:${step.n}:${step.reveal}` : "empty";
      if (key === lastKey) return;
      lastKey = key;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);
      if (!step) return;
      const o = (SIZE - ICON) / 2;
      if (step.n === 0) {
        ctx.drawImage(sprite(current), o, o, ICON, ICON);
        return;
      }
      const m = mask(current, step.n);
      const bs = ICON / step.n;
      ctx.fillStyle = icons[current].color;
      for (let i = 0; i < m.length; i++) {
        if (!m[i] || hash(i, cycle, 5) > step.reveal) continue;
        ctx.fillRect(o + (i % step.n) * bs, o + Math.floor(i / step.n) * bs, bs, bs);
      }
    };

    let cycle = 0;
    const advance = (now: number) => {
      const elapsed = now - stageStart;
      if (elapsed < 0) return draw(null, cycle);
      const steps = IN_STEPS.length * STEP_MS;
      if (stage === "in") {
        if (elapsed >= steps) return go("hold", now);
        draw(IN_STEPS[Math.floor(elapsed / STEP_MS)], cycle);
      } else if (stage === "hold") {
        draw(IN_STEPS[IN_STEPS.length - 1], cycle);
        if (!reduce && elapsed >= hold) go("out", now);
      } else if (stage === "out") {
        if (elapsed >= steps) return go("gap", now);
        draw(IN_STEPS[IN_STEPS.length - 1 - Math.floor(elapsed / STEP_MS)], cycle);
      } else {
        draw(null, cycle);
        if (elapsed >= 320) {
          current = (current + (cycle > 0 ? 1 : 0)) % icons.length;
          cycle++;
          go("in", now);
        }
      }
    };
    const go = (next: Stage, now: number) => {
      stage = next;
      stageStart = now;
      hold = 2600 + Math.random() * 2200;
      advance(now);
    };

    const tick = (now: number) => {
      advance(now);
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
    const poke = () => {
      if (stage === "hold") go("out", performance.now());
    };
    cell?.addEventListener("pointerenter", poke);
    const io = new IntersectionObserver(([e]) => ((visible = e.isIntersecting) ? play() : pause()));
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) draw(IN_STEPS[IN_STEPS.length - 1], 0);
    else play();
    return () => {
      pause();
      io.disconnect();
      cell?.removeEventListener("pointerenter", poke);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [icons, delay, reduce]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none size-[112px]" />;
}
