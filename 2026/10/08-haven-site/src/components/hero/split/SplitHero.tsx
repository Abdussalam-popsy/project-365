"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DEMO_URL, hero } from "@/content/site";
import { Button } from "../../Button";
import { FacadeMosaic } from "./FacadeMosaic";
import { PixelIcon, type PixelIconSpec } from "./PixelIcon";

const ease = [0.16, 1, 0.3, 1] as const;
const LILAC = "#c9c1ff";
const VIOLET = "#8b7bff";
const MINT = "#8ee6b4";
const EMBER = "#ff9a5c";

type Cell = { icons?: PixelIconSpec[]; mosaic?: true; delay?: number; desktopOnly?: true };

/** Two columns by four rows, like LocalCan's hero; the last four cells are hidden below lg. */
const cells: Cell[] = [
  { icons: [{ icon: "phone", color: EMBER }, { icon: "check", color: MINT }], delay: 0.2 },
  { icons: [{ icon: "home", color: LILAC }, { icon: "calendar", color: VIOLET }], delay: 1.1 },
  { mosaic: true },
  { icons: [{ icon: "wrench", color: EMBER }, { icon: "key", color: LILAC }], delay: 0.7 },
  { desktopOnly: true },
  { icons: [{ icon: "chevrons", color: MINT }, { icon: "dotsX", color: "rgba(255,255,255,0.55)" }], delay: 1.6, desktopOnly: true },
  { desktopOnly: true },
  { icons: [{ icon: "message", color: VIOLET }, { icon: "bell", color: EMBER }], delay: 2.2, desktopOnly: true },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="-my-1 -mr-2 ml-3 grid size-6 place-items-center rounded-md border border-current/30 bg-current/5 font-sans text-[13px] font-medium opacity-80 max-sm:hidden">
      {children}
    </kbd>
  );
}

export default function SplitHero() {
  const reduce = !!useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % hero.rotating.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  // LocalCan-style single-key shortcuts for the two buttons.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      if (e.key === "b") window.location.href = DEMO_URL;
      if (e.key === "h") document.getElementById("voice-demo")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reduce]);

  return (
    <section className="bg-ink px-3 pt-[112px] pb-6 text-white sm:px-4">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-xl bg-plum-950 p-3 sm:p-4">
        <div className="grid border border-white/20 lg:grid-cols-2">
          <div className="px-6 py-8 sm:px-12 sm:py-11">
            <p className="inline-flex items-center gap-2 rounded-lg border border-white/20 py-1 pr-3 pl-2.5 font-mono text-[11px] text-white/80 sm:text-[13px]">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#8ee6b4]/60 motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-[#8ee6b4]" />
              </span>
              {hero.lead}
            </p>

            <h1 className="mt-6 text-[clamp(2.1rem,1.4rem+3.4vw,4rem)] leading-[1.02] font-light tracking-[-0.04em]">
              {hero.prefix}
              <span className="relative block h-[1.1em] overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={hero.rotating[index]}
                    className="absolute inset-x-0 whitespace-nowrap text-lilac"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                  >
                    {hero.rotating[index]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="mt-6 max-w-[34ch] text-xl leading-tight text-balance text-white/75">{hero.sub}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="light" className="rounded-lg">
                Book a demo
                <Kbd>B</Kbd>
              </Button>
              <Button variant="outline" href="#voice-demo" className="rounded-lg">
                Hear a call
                <Kbd>H</Kbd>
              </Button>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-white/55">
              <span className="grid size-4 place-items-center bg-[#f26522] text-[10px] font-semibold text-white">Y</span>
              Backed by Y Combinator
            </p>
          </div>

          <div className="grid grid-cols-2 border-t border-white/20 max-lg:auto-rows-[minmax(8rem,1fr)] lg:grid-rows-4 lg:border-t-0 lg:border-l">
            {cells.map((cell, i) => (
              <div
                key={i}
                className={`relative grid place-items-center overflow-hidden border-white/20 ${i % 2 ? "border-l" : ""} ${i >= 2 ? "border-t" : ""} ${cell.desktopOnly ? "max-lg:hidden" : ""}`}
              >
                {cell.mosaic && <FacadeMosaic reduce={reduce} />}
                {cell.icons && <PixelIcon icons={cell.icons} delay={cell.delay} reduce={reduce} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
