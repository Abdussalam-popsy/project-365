import type { Stat, TitlePart } from "@/content/agents/types";
import { Reveal } from "../Reveal";
import { TitleText } from "./TitleText";

/** Dark band: a heading, one line of context, and big numbers in a row (two columns on phones). */
export function StatsBand({ title, body, items }: { title: TitlePart[]; body: string; items: Stat[] }) {
  return (
    <section className="grain relative overflow-hidden bg-night px-6 py-28 text-white sm:py-32">
      <div className="relative mx-auto max-w-[1140px]">
        <Reveal className="max-w-[620px]">
          <h2 className="text-[36px] leading-[1.06] font-light tracking-[-0.035em] sm:text-[48px]">
            <TitleText title={title} dark />
          </h2>
          <p className="mt-5 text-[17px] text-white/60">{body}</p>
        </Reveal>
        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {items.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-[44px] leading-none font-light tracking-[-0.03em] text-white/55 sm:text-[60px]">{stat.value}</dd>
              <dd className="mt-4 max-w-[220px] text-[14px] leading-snug text-white/60">{stat.label}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
