"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTuning, type TuningSpecs } from "@/lib/tuning";
import {
  createHavenCity,
  defaultHavenCityParams as tower,
  residentialCityParams as home,
  type HavenCityParams,
  type HavenCityVariant,
} from "./city/createHavenCity";

/** v2 sliders. Defaults come straight from `defaultHavenCityParams`, so the untouched scene is unchanged. */
const skylineTuning = {
  speed: { label: "Drift speed", min: 0, max: 1.5, step: 0.01, value: tower.speed },
  towerHeight: { label: "Tower height", min: 0.4, max: 1.8, step: 0.01, value: tower.towerHeight },
  windowDensity: { label: "Lit windows", min: 0, max: 0.8, step: 0.01, value: tower.windowDensity },
  flicker: { label: "Blinking windows", min: 0, max: 0.4, step: 0.01, value: tower.flicker },
  ambientFlashEvery: { label: "Auto flash every (s, 0 = off)", min: 0, max: 8, step: 0.1, value: tower.ambientFlashEvery },
  glow: { label: "Glow", min: 0, max: 2, step: 0.01, value: tower.glow },
} satisfies TuningSpecs;

/** v4 sliders. Defaults come from `residentialCityParams`. */
const residentialTuning = {
  speed: { label: "Drift speed", min: 0, max: 1.5, step: 0.01, value: home.speed },
  storeys: { label: "Apartment storeys (max)", min: 3, max: 8, step: 1, value: home.storeys },
  houseShare: { label: "Houses vs apartments", min: 0, max: 1, step: 0.01, value: home.houseShare },
  roofPitch: { label: "Roof pitch", min: 0, max: 1.6, step: 0.01, value: home.roofPitch },
  windowDensity: { label: "Lit windows", min: 0, max: 0.8, step: 0.01, value: home.windowDensity },
  warmth: { label: "Warm windows", min: 0, max: 1, step: 0.01, value: home.warmth },
  flicker: { label: "Blinking windows", min: 0, max: 0.4, step: 0.01, value: home.flicker },
  cameraHeight: { label: "Camera height", min: 1.2, max: 5, step: 0.05, value: home.cameraHeight },
  ambientFlashEvery: { label: "Auto flash every (s, 0 = off)", min: 0, max: 8, step: 0.1, value: home.ambientFlashEvery },
  glow: { label: "Glow", min: 0, max: 2, step: 0.01, value: home.glow },
} satisfies TuningSpecs;

function CityScene({
  variant,
  id,
  title,
  specs,
}: {
  variant: HavenCityVariant;
  id: string;
  title: string;
  specs: TuningSpecs;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const tuned = useTuning(id, title, specs);

  // Rebuilding the scene is heavier than a slider tick, so wait until the slider rests.
  const [params, setParams] = useState(tuned);
  useEffect(() => {
    const timer = setTimeout(
      () => setParams((prev) => (JSON.stringify(prev) === JSON.stringify(tuned) ? prev : tuned)),
      150,
    );
    return () => clearTimeout(timer);
  }, [tuned]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const city = createHavenCity(canvas, {
        variant,
        params: params as Partial<HavenCityParams>,
        reducedMotion: !!reduce,
      });
      return () => city.dispose();
    } catch {
      // No WebGL: the CSS gradient underneath stays as the backdrop.
    }
  }, [reduce, params, variant]);

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_70%,#43234f_0%,#26132f_55%,#1e0f26_80%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
      <div className="absolute inset-x-0 top-[18%] mx-auto h-[70%] max-w-[900px] bg-[radial-gradient(closest-side,rgba(30,15,38,0.55),transparent)]" />
    </>
  );
}

export default function CityBackdrop() {
  return <CityScene variant="towers" id="skyline" title="Skyline (v2)" specs={skylineTuning} />;
}

export function ResidentialBackdrop() {
  return <CityScene variant="residential" id="residential" title="Residential (v4)" specs={residentialTuning} />;
}
