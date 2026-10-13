"use client";

import { useEffect, useState } from "react";
import { outcomesIntro } from "@/content/outcomes";
import { OutcomesCalendar } from "./outcomes/OutcomesCalendar";
import { SectionGlow } from "./SectionGlow";
import { SectionIntro } from "./SectionHeading";
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
      {/* Plum glow behind the calendar. Adjust it with the Glow editor (dev tools). */}
      <SectionGlow id="outcomes" />
      <div className="relative mx-auto max-w-[920px]">
        <SectionIntro eyebrow={outcomesIntro.eyebrow} title={outcomesIntro.title} body={outcomesIntro.body} align="center" dark />

        <Reveal delay={0.15} className="mock-compact mt-14">
          <OutcomesCalendar key={phone ? "day" : "team"} layout={phone ? "day" : "team"} />
        </Reveal>
      </div>
    </section>
  );
}
