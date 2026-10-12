"use client";

import { useEffect, useRef, useState } from "react";
import { ctaGlow, type GlowValues } from "@/content/ctaGlow";
import { FinalCta } from "../FinalCta";

const STORAGE_KEY = "haven-cta-glow-tool";

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

/** A focused tool for the closing section's glow: live preview, drag to move it, colours, sizes, reset and copy. */
export function GlowTool() {
  const [values, setValues] = useState<GlowValues>(ctaGlow);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Restore this browser's last session after mount (the server render always starts from the site values).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved && typeof saved === "object") setValues({ ...ctaGlow, ...saved });
    } catch {
      // Ignore unreadable or blocked storage: start from the site values.
    }
  }, []);

  const update = (patch: Partial<GlowValues>) =>
    setValues((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage blocked: the tool still works for this visit.
      }
      return next;
    });

  const moveTo = (clientX: number, clientY: number) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    update({
      x: Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))),
      y: Math.round(Math.min(130, Math.max(-20, ((clientY - rect.top) / rect.height) * 100))),
    });
  };

  const reset = () => {
    setValues(ctaGlow);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing saved to clear.
    }
  };

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
  const changed = (key: keyof GlowValues) => values[key] !== ctaGlow[key];

  return (
    <div className="grid min-h-screen bg-[#161219] text-white lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4 p-4 sm:p-8">
        <div>
          <h1 className="text-[22px] font-light tracking-[-0.02em]">Closing section glow</h1>
          <p className="mt-1 text-[14px] text-white/50">Click or drag on the preview to move the glow. Changes are saved in this browser.</p>
        </div>
        <div
          ref={previewRef}
          className="relative cursor-crosshair touch-none overflow-hidden rounded-2xl border border-white/10"
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            moveTo(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => dragging.current && moveTo(e.clientX, e.clientY)}
          onPointerUp={() => (dragging.current = false)}
        >
          {/* The real section, so the preview is exactly what ships. Clicks go to the drag layer, not its buttons. */}
          <div className="pointer-events-none select-none">
            <FinalCta glow={values} callHref="#" />
          </div>
          <span
            className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/20 shadow-[0_0_0_4px_rgba(0,0,0,0.25)]"
            style={{ left: `${values.x}%`, top: `${values.y}%` }}
            aria-hidden
          />
        </div>
      </div>

      <aside className="flex flex-col gap-6 border-white/10 bg-[#1d1821] p-6 lg:border-l">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="text-[12px] font-medium tracking-[0.14em] text-lilac uppercase">{group.title}</h2>
            <div className="mt-3 flex flex-col gap-3">
              {group.color && (
                <label className="flex items-center justify-between gap-3 text-[13px]">
                  <span className={changed(group.color.key) ? "text-lilac" : "text-white/70"}>{group.color.label}</span>
                  <span className="flex items-center gap-2 font-mono text-[12px] text-white/50">
                    {values[group.color.key]}
                    <input
                      type="color"
                      value={values[group.color.key]}
                      onChange={(e) => update({ [group.color!.key]: e.target.value })}
                      className="size-8 cursor-pointer rounded-md border border-white/15 bg-transparent"
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
                    onChange={(e) => update({ [s.key]: round(Number(e.target.value)) })}
                    className="mt-1.5 w-full accent-lilac"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex gap-2">
            <button type="button" onClick={copy} className="flex-1 rounded-[10px] bg-page py-2.5 text-[14px] font-medium text-ink hover:bg-lilac">
              {copied ? "Copied" : "Copy values"}
            </button>
            <button type="button" onClick={reset} className="rounded-[10px] border border-white/20 px-4 py-2.5 text-[14px] text-white/80 hover:border-white/50">
              Reset
            </button>
          </div>
          <p className="text-[12px] text-white/40">Reset returns to what the site uses now. Paste the copied values in chat to make them permanent.</p>
          <pre className="max-h-48 overflow-auto rounded-xl bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/60 select-all">{output}</pre>
        </div>
      </aside>
    </div>
  );
}
