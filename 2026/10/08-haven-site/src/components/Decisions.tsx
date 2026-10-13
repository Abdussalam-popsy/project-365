import { decisionPoints, decisionsIntro } from "@/content/decisions";
import { TitleText } from "./agent-page/TitleText";
import { DecisionTrace } from "./decisions/DecisionTrace";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

/** Every decision, explained: the "Why?" behind one dispatch, beside what that guarantees. */
export function Decisions() {
  return (
    <section id="decisions" className="scroll-mt-28 bg-page px-6 pb-32">
      <div className="mx-auto max-w-[1140px] border-t border-ink/10 pt-24">
        <Reveal className="max-w-[680px]">
          <Eyebrow>{decisionsIntro.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[40px] leading-[1.05] font-light tracking-[-0.035em] text-balance sm:text-[52px]">
            <TitleText title={decisionsIntro.title} />
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-ink/55 sm:text-lg">{decisionsIntro.body}</p>
        </Reveal>

        {/* Trace first in the markup, so phones read heading → mock → points; side by side from lg up. */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal delay={0.15} className="mock-compact">
            <DecisionTrace />
          </Reveal>
          <ul className="border-t border-ink/10">
            {decisionPoints.map((point, i) => (
              <li key={point.title} className="border-b border-ink/10">
                <Reveal delay={i * 0.06} className="py-6">
                  <h3 className="text-[19px] tracking-[-0.01em]">{point.title}</h3>
                  <p className="mt-2 max-w-[440px] text-[16px] leading-relaxed text-ink/55">{point.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
