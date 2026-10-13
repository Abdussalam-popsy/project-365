"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { glowSections, glows, type GlowId, type GlowValues } from "@/content/glows";
import { useDevToolsVisible } from "@/lib/devTools";
import { resetGlow, setGlow, setGlowEditing, useGlow } from "@/lib/glowStore";
import { tuningEnabled } from "@/lib/tuning";

type NumberKey = { [K in keyof GlowValues]: GlowValues[K] extends number ? K : never }[keyof GlowValues];
type ColorKey = { [K in keyof GlowValues]: GlowValues[K] extends string ? K : never }[keyof GlowValues];
interface SliderSpec {
  key: NumberKey;
  label: string;
  min: number;
  max: number;
  step: number;
}

const groups: { title: string; color?: { key: ColorKey; label: string }; sliders: SliderSpec[] }[] = [
  {
    title: "Position",
    sliders: [
      { key: "x", label: "Left / right (%)", min: 0, max: 100, step: 1 },
      { key: "y", label: "Up / down (%)", min: -20, max: 130, step: 1 },
    ],
  },
  {
    title: "Main glow",
    color: { key: "color", label: "Colour" },
    sliders: [
      { key: "strength", label: "Strength", min: 0, max: 1, step: 0.01 },
      { key: "width", label: "Width (%)", min: 10, max: 160, step: 1 },
      { key: "height", label: "Height (%)", min: 10, max: 160, step: 1 },
    ],
  },
  {
    title: "Accent glow",
    color: { key: "accent", label: "Colour" },
    sliders: [
      { key: "accentStrength", label: "Strength", min: 0, max: 1, step: 0.01 },
      { key: "accentSize", label: "Size (% of main)", min: 10, max: 120, step: 1 },
      { key: "accentOffsetY", label: "Offset below centre (%)", min: -40, max: 40, step: 1 },
    ],
  },
  { title: "Section", color: { key: "background", label: "Background" }, sliders: [] },
];

const round = (n: number) => Math.round(n * 100) / 100;
const decimals = (step: number) => (String(step).split(".")[1] ?? "").length;

const glowIds = Object.keys(glowSections) as GlowId[];

/**
 * A small "Glow editor" button on the real pages (dev tools only) that opens an editor for the dark sections'
 * gradients: pick one at the top when the page has several. Edits apply live to the actual section, so you see
 * it in context, on any screen size; on phones the panel docks to the bottom. Copy values → paste into
 * src/content/glows.ts under that glow's name.
 */
export function GlowEditor() {
  const visible = useDevToolsVisible();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState<GlowId[]>([]);
  const [current, setCurrent] = useState<GlowId>("closing");
  const [copied, setCopied] = useState(false);
  const { values } = useGlow(current);

  // Only offer the glows whose sections are on this page.
  useEffect(() => {
    const found = glowIds.filter((id) => document.getElementById(glowSections[id].sectionId));
    setPresent(found);
    setCurrent((c) => (found.includes(c) ? c : (found[0] ?? c)));
  }, [pathname]);

  const active = visible && present.length > 0 && tuningEnabled();
  useEffect(() => setGlowEditing(active && open ? current : null), [active, open, current]);
  if (!active) return null;

  const output = JSON.stringify(values, null, 2);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the values are also shown below to select by hand.
    }
  };
  const changed = (key: keyof GlowValues) => values[key] !== glows[current][key];
  const jump = (id: GlowId = current) =>
    document.getElementById(glowSections[id].sectionId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  const pick = (id: GlowId) => {
    setCurrent(id);
    jump(id);
  };

  if (!open)
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          jump();
        }}
        className="fixed bottom-4 left-4 z-[60] rounded-full border border-white/15 bg-night/90 px-4 py-2 text-[13px] text-white/85 backdrop-blur-md hover:bg-night"
      >
        Glow editor
      </button>
    );

  return (
    <div className="fixed inset-x-3 bottom-20 z-[60] flex max-h-[42vh] flex-col rounded-2xl border border-white/15 bg-night/95 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-h-[75vh] sm:w-[320px]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <p className="mr-auto text-[14px]">Glow · {glowSections[current].label}</p>
        <button type="button" onClick={() => jump()} className="rounded-full px-2.5 py-1 text-[12px] text-white/60 hover:bg-white/10 hover:text-white">
          Jump to section
        </button>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close glow editor" className="grid size-7 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
          ×
        </button>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4">
        {present.length > 1 && (
          <div className="flex rounded-xl border border-white/10 p-1 text-[12px]">
            {present.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => pick(id)}
                className={`flex-1 rounded-lg px-2 py-1.5 transition-colors ${id === current ? "bg-page text-ink" : "text-white/60 hover:text-white"}`}
              >
                {glowSections[id].label}
              </button>
            ))}
          </div>
        )}
        <p className="text-[12px] text-white/45">Drag on the section itself to move the glow.</p>
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="text-[11px] font-medium tracking-[0.14em] text-lilac uppercase">{group.title}</h2>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {group.color && (
                <label className="flex items-center justify-between gap-3 text-[13px]">
                  <span className={changed(group.color.key) ? "text-lilac" : "text-white/70"}>{group.color.label}</span>
                  <span className="flex items-center gap-2 font-mono text-[12px] text-white/50">
                    {values[group.color.key]}
                    <input
                      type="color"
                      value={values[group.color.key]}
                      onChange={(e) => setGlow(current, { [group.color!.key]: e.target.value })}
                      className="size-7 cursor-pointer rounded-md border border-white/15 bg-transparent"
                    />
                  </span>
                </label>
              )}
              {group.sliders.map((s) => (
                <label key={s.key} className="block text-[13px]">
                  <span className="flex justify-between">
                    <span className={changed(s.key) ? "text-lilac" : "text-white/70"}>{s.label}</span>
                    <span className="font-mono text-[12px] text-white/50">{values[s.key].toFixed(decimals(s.step))}</span>
                  </span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={values[s.key]}
                    onChange={(e) => setGlow(current, { [s.key]: round(Number(e.target.value)) })}
                    className="mt-1 w-full accent-lilac"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
        <pre className="max-h-32 overflow-auto rounded-xl bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/60 select-all">{output}</pre>
      </div>

      <div className="flex gap-2 border-t border-white/10 px-4 py-3">
        <button type="button" onClick={copy} className="flex-1 rounded-[10px] bg-page py-2 text-[13px] font-medium text-ink hover:bg-lilac">
          {copied ? "Copied" : "Copy values"}
        </button>
        <button type="button" onClick={() => resetGlow(current)} className="rounded-[10px] border border-white/20 px-4 py-2 text-[13px] text-white/80 hover:border-white/50">
          Reset
        </button>
      </div>
    </div>
  );
}
