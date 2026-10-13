"use client";

import { firmFeatures, firmIntro, scopes } from "@/content/firmContext";
import { FeatureGrid } from "./agent-page/FeatureGrid";
import { AutoStepper } from "./agent-page/motion/AutoStepper";
import { TitleText } from "./agent-page/TitleText";
import { FirmContextCard } from "./firm/FirmContextCard";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

const SCOPE_MS = 5000;

/** It knows your firm, down to the unit: the rules behind one work order, layered from firm to unit. */
export function FirmContext() {
  return (
    <section id="firm-context" className="scroll-mt-28 bg-page px-6 py-32">
      <div className="mx-auto max-w-[1140px]">
        <Reveal className="max-w-[680px]">
          <Eyebrow>{firmIntro.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[40px] leading-[1.05] font-light tracking-[-0.035em] text-balance sm:text-[52px]">
            <TitleText title={firmIntro.title} />
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-ink/55 sm:text-lg">{firmIntro.body}</p>
        </Reveal>

        <AutoStepper items={scopes} stepMs={SCOPE_MS} showTimer renderVisual={(active) => <FirmContextCard depth={active} />} />

        <FeatureGrid items={firmFeatures} />
      </div>
    </section>
  );
}
