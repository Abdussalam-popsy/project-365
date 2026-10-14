import type { Stat, TitlePart } from "@/content/agents/types";
import { Reveal } from "../Reveal";
import { TitleText } from "./TitleText";

/** Columns per stat count, spelled out so Tailwind sees each class. Three stack on phones; four pair up. */
const columns: Record<number, string> = {
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

/** Dark band: a heading, one line of context, and big numbers in a row, each unit small and lilac. */
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
        <dl className={`mt-16 grid gap-x-10 gap-y-12 ${columns[items.length] ?? columns[4]}`}>
          {items.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="flex items-baseline gap-1.5 leading-none font-light tracking-[-0.04em]">
                <span className="text-[64px] sm:text-[72px] lg:text-[88px]">{stat.value}</span>
                {stat.unit && (
                  <span className={`text-lilac ${stat.unit.length > 1 ? "text-[30px] tracking-[-0.02em] sm:text-[34px] lg:text-[40px]" : "text-[52px] sm:text-[58px] lg:text-[72px]"}`}>
                    {stat.unit}
                  </span>
                )}
              </dd>
              <dd className="mt-4 max-w-[260px] text-[16px] leading-snug text-white/70">{stat.label}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
