import { outcomesIntro } from "@/content/outcomes";
import { TitleText } from "./agent-page/TitleText";
import { OutcomesDay } from "./outcomes/OutcomesDay";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

/** Outcomes, around the clock: a sample day of what the agents get done, no stats. */
export function Outcomes() {
  return (
    <section id="outcomes" className="grain relative overflow-hidden bg-night px-6 py-32 text-white">
      <div className="absolute bottom-0 left-1/2 size-[720px] -translate-x-1/2 translate-y-1/2 rounded-full bg-plum-800/60 blur-[140px]" />
      <div className="relative mx-auto max-w-[920px]">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <Eyebrow tone="dark">{outcomesIntro.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[40px] leading-[1.05] font-light tracking-[-0.035em] text-balance sm:text-[56px]">
            <TitleText title={outcomesIntro.title} dark />
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/60 sm:text-lg">{outcomesIntro.body}</p>
        </Reveal>
        <Reveal delay={0.15} className="mock-compact mt-14">
          <OutcomesDay />
        </Reveal>
      </div>
    </section>
  );
}
