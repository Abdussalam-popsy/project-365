"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTuning, type TuningSpecs } from "@/lib/tuning";
import { createHavenSuburb, defaultHavenSuburbParams as d } from "./suburb/createHavenSuburb";
import type { SuburbThemeName } from "./suburb/suburbTheme";

const suburbTuning = {
  speed: { label: "Drift speed", min: 0, max: 1.5, step: 0.01, value: d.speed },
  curve: { label: "Road bend", min: -0.012, max: 0.012, step: 0.0005, value: d.curve },
  cameraHeight: { label: "Camera height", min: 1.5, max: 8, step: 0.1, value: d.cameraHeight },
  lookY: { label: "Look up/down", min: -2, max: 3, step: 0.05, value: d.lookY },
  litWindows: { label: "Lit windows", min: 0, max: 1, step: 0.01, value: d.litWindows },
  warmth: { label: "Warm windows", min: 0, max: 1, step: 0.01, value: d.warmth },
  flicker: { label: "Blinking windows", min: 0, max: 0.5, step: 0.01, value: d.flicker },
  trees: { label: "Trees", min: 0, max: 1, step: 0.01, value: d.trees },
  sway: { label: "Camera sway", min: 0, max: 1.5, step: 0.01, value: d.sway },
  ambientFlashEvery: { label: "Auto flash every (s, 0 = off)", min: 0, max: 8, step: 0.1, value: d.ambientFlashEvery },
  glow: { label: "Glow", min: 0, max: 2, step: 0.01, value: d.glow },
} satisfies TuningSpecs;

const overlays: Record<SuburbThemeName, { base: string; top: string; centre: string }> = {
  dark: {
    base: "bg-[radial-gradient(120%_70%_at_50%_70%,#43234f_0%,#26132f_55%,#1e0f26_80%)]",
    top: "from-ink/80",
    centre: "bg-[radial-gradient(closest-side,rgba(30,15,38,0.55),transparent)]",
  },
  light: {
    base: "bg-mist",
    top: "from-mist/90",
    centre: "bg-[radial-gradient(closest-side,rgba(247,244,250,0.7),transparent)]",
  },
};

function SuburbScene({ theme }: { theme: SuburbThemeName }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const tuned = useTuning("suburb", "Neighbourhood (v5)", suburbTuning);

  const [params, setParams] = useState(tuned);
  useEffect(() => {
    const timer = setTimeout(() => setParams((prev) => (JSON.stringify(prev) === JSON.stringify(tuned) ? prev : tuned)), 150);
    return () => clearTimeout(timer);
  }, [tuned]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const suburb = createHavenSuburb(canvas, { theme, params, reducedMotion: !!reduce });
      return () => suburb.dispose();
    } catch {
      // No WebGL: the CSS gradient underneath stays as the backdrop.
    }
  }, [reduce, params, theme]);

  const o = overlays[theme];
  return (
    <>
      <div className={`absolute inset-0 ${o.base}`} />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${o.top} to-transparent`} />
      <div className={`absolute inset-x-0 top-[12%] mx-auto h-[62%] max-w-[900px] ${o.centre}`} />
    </>
  );
}

export default function SuburbBackdrop() {
  return <SuburbScene theme="dark" />;
}

export function SuburbBackdropLight() {
  return <SuburbScene theme="light" />;
}
