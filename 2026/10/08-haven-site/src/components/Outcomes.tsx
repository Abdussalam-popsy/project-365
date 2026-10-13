"use client";

import { useEffect, useState } from "react";
import { outcomesIntro } from "@/content/outcomes";
import { useDevToolsVisible } from "@/lib/devTools";
import { TitleText } from "./agent-page/TitleText";
import { OutcomesCalendar } from "./outcomes/OutcomesCalendar";
import { OutcomesStrip } from "./outcomes/OutcomesStrip";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

// Three takes on the sample day, compared on the real page (dev tools: press § or `). The default is
// what visitors see; the choice is remembered per browser while we decide.
const variants = [
  { id: "team", label: "Team vs Haven" },
  { id: "day", label: "Day view" },
  { id: "strip", label: "Strip + feed" },
] as const;
type Variant = (typeof variants)[number]["id"];
const DEFAULT_VARIANT: Variant = "team";
const STORAGE_KEY = "haven-outcomes-variant";

function useOutcomesVariant(): [Variant, (v: Variant) => void] {
  const [variant, setVariant] = useState<Variant>(DEFAULT_VARIANT);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (variants.some((v) => v.id === saved)) setVariant(saved as Variant);
    } catch {
      // Storage blocked: stay on the default.
    }
  }, []);
  const choose = (v: Variant) => {
    setVariant(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // Storage blocked: the choice lasts for this page view.
    }
  };
  return [variant, choose];
}

/** Phones are too narrow for four calendar columns, so the team layout falls back to the day view there. */
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
  const [variant, setVariant] = useOutcomesVariant();
  const devTools = useDevToolsVisible();
  const phone = usePhone();
  const layout = variant === "team" && phone ? "day" : variant;

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

        {devTools && (
          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-xl border border-white/15 bg-white/[0.04] p-1 text-[13px]">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariant(v.id)}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${variant === v.id ? "bg-page text-ink" : "text-white/60 hover:text-white"}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Reveal delay={0.15} className={`mock-compact ${devTools ? "mt-6" : "mt-14"}`}>
          {layout === "strip" ? <OutcomesStrip /> : <OutcomesCalendar key={layout} layout={layout} />}
        </Reveal>
      </div>
    </section>
  );
}
