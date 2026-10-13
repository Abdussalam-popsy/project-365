"use client";

import { firmIntro, scopes } from "@/content/firmContext";
import { AutoStepper } from "./agent-page/motion/AutoStepper";
import { FirmContextCard } from "./firm/FirmContextCard";
import { SectionIntro } from "./SectionHeading";

const SCOPE_MS = 5000;

/** It knows your firm, down to the unit: the rules behind one work order, layered from firm to unit. */
export function FirmContext() {
  return (
    <section id="firm-context" className="scroll-mt-28 bg-page px-6 py-32">
      <div className="mx-auto max-w-[1140px]">
        <SectionIntro eyebrow={firmIntro.eyebrow} title={firmIntro.title} body={firmIntro.body} />

        <AutoStepper items={scopes} stepMs={SCOPE_MS} showTimer renderVisual={(active) => <FirmContextCard depth={active} />} />

      </div>
    </section>
  );
}
