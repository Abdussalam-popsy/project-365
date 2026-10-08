"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { createHavenCity } from "./city/createHavenCity";

export default function CityBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const city = createHavenCity(canvas, { reducedMotion: !!reduce });
      return () => city.dispose();
    } catch {
      // No WebGL: the CSS gradient underneath stays as the backdrop.
    }
  }, [reduce]);

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_70%,#22145f_0%,#0f0833_55%,#0b062a_80%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
      <div className="absolute inset-x-0 top-[18%] mx-auto h-[70%] max-w-[900px] bg-[radial-gradient(closest-side,rgba(11,6,42,0.55),transparent)]" />
    </>
  );
}
