"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { HavenField } from "../HavenField";
import GridBackdrop from "./GridBackdrop";
import SplitHero from "./split/SplitHero";

export type HeroVersion = {
  id: string;
  label: string;
  /** Swaps only what sits behind the shared centred hero copy. */
  Backdrop?: ComponentType;
  /** Replaces the whole hero section (its own layout and copy placement). */
  Layout?: ComponentType;
};

const CityBackdrop = dynamic(() => import("./CityBackdrop"), { ssr: false });

function SignalGridBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,#22145f_0%,#0f0833_55%,#0b062a_80%)]" />
      <HavenField className="absolute inset-0 size-full" params={{ horizon: 0.66, lineOpacity: 0.3 }} />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-[8%] mx-auto h-[38%] max-w-[760px] bg-[radial-gradient(closest-side,rgba(11,6,42,0.75),transparent)]" />
    </>
  );
}

/** Every hero backdrop we have tried, oldest first. Add new ones at the end. */
export const heroVersions: HeroVersion[] = [
  { id: "v1", label: "Signal grid", Backdrop: SignalGridBackdrop },
  { id: "v2", label: "Skyline", Backdrop: CityBackdrop },
  { id: "v3", label: "Split grid", Layout: SplitHero },
  { id: "v3-alt", label: "Centred grid", Backdrop: GridBackdrop },
];

/** The version real visitors see. */
export const defaultHeroVersion = "v2";
