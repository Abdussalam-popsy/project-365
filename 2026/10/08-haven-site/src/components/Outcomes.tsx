"use client";

import { useEffect, useState } from "react";
import { outcomesIntro } from "@/content/outcomes";
import { TitleText } from "./agent-page/TitleText";
import { OutcomesCalendar } from "./outcomes/OutcomesCalendar";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

/** Phones are too narrow for four calendar columns, so they get the one-column day view instead. */
function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const sync = () => setPhone(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return phone;
}

/** Outcomes, around the clock: a sample day of what the agents get done, no stats. */
export function Outcomes() {
  const phone = usePhone();

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
          <OutcomesCalendar key={phone ? "day" : "team"} layout={phone ? "day" : "team"} />
        </Reveal>
      </div>
    </section>
  );
}
