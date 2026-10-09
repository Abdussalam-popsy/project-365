"use client";

import { useEffect, useState } from "react";
import {
  changedTuning,
  resetTuning,
  setTuning,
  subscribeTuning,
  tuningEnabled,
  visibleTuningGroups,
} from "@/lib/tuning";

const decimals = (step: number) => (String(step).split(".")[1] ?? "").length;

/** Floating slider panel for every `useTuning` group on screen. Dev, or `?tune`. */
export function DevTuner() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, rerender] = useState(0);

  useEffect(() => {
    setEnabled(tuningEnabled());
    return subscribeTuning(() => rerender((n) => n + 1));
  }, []);

  if (!enabled) return null;
  const groups = visibleTuningGroups();

  const copy = async () => {
    const changed = changedTuning();
    const text = Object.keys(changed).length ? JSON.stringify(changed, null, 2) : "No changes from the defaults.";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="fixed top-28 right-4 z-[60] w-[300px] text-[12px] text-white/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ml-auto block rounded-full border border-white/15 bg-ink/85 px-3 py-1.5 backdrop-blur-md hover:bg-ink"
      >
        {open ? "Close tuner" : "Tune"}
      </button>
      {open && (
        <div className="mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/15 bg-ink/90 p-3 backdrop-blur-md">
          {groups.length === 0 && <p className="text-white/50">Nothing tunable on screen.</p>}
          {groups.map(([id, group]) => (
            <section key={id} className="mb-4 last:mb-2">
              <header className="mb-2 flex items-center justify-between">
                <h2 className="font-medium text-white">{group.title}</h2>
                <button type="button" onClick={() => resetTuning(id)} className="text-white/45 hover:text-white">
                  Reset
                </button>
              </header>
              {Object.entries(group.specs).map(([key, spec]) => {
                const value = group.values[key];
                const moved = value !== spec.value;
                return (
                  <label key={key} className="mb-2 block">
                    <span className="flex justify-between">
                      <span className={moved ? "text-lilac" : undefined}>{spec.label}</span>
                      <span className="font-mono text-white/55">{value.toFixed(decimals(spec.step))}</span>
                    </span>
                    <input
                      type="range"
                      min={spec.min}
                      max={spec.max}
                      step={spec.step}
                      value={value}
                      onChange={(e) => setTuning(id, key, Number(e.target.value))}
                      className="mt-1 w-full accent-lilac"
                    />
                  </label>
                );
              })}
            </section>
          ))}
          <button
            type="button"
            onClick={copy}
            className="w-full rounded-full bg-lilac py-1.5 font-medium text-ink hover:bg-white"
          >
            {copied ? "Copied" : "Copy values"}
          </button>
        </div>
      )}
    </div>
  );
}
