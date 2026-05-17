import { useState } from "react";
import {
  type GradientKey,
  type GradientMap,
  type Stop,
  stopToGradientStyle,
} from "./types";

const CARD_LABELS: Record<GradientKey, string> = {
  receive: "Receive",
  sops:    "Act on SOPs",
  pms:     "Sync to PMS",
};

function Slider({
  label, value, min, max, unit = "%", onChange,
}: {
  label: string; value: number; min: number; max: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="flex justify-between text-neutral-500">
        <span>{label}</span>
        <span className="text-neutral-400">{value}{unit}</span>
      </span>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-white" />
    </label>
  );
}

export function GradientEditor({
  gradients, onChange,
}: {
  gradients: GradientMap;
  onChange: (key: GradientKey, stop: Stop) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<GradientKey>("receive");
  const stop = gradients[active];
  const set = (patch: Partial<Stop>) => onChange(active, { ...stop, ...patch });

  return (
    <div className="fixed bottom-4 left-4 z-[110] font-mono text-xs">
      {/* Hidden until hovered — opacity-0 to opacity-100 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900/60 text-white opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 hover:opacity-100"
        title="Gradient editor"
      >
        ✦
      </button>

      {open && (
        <div className="mt-2 w-72 rounded-xl bg-neutral-900/90 p-4 shadow-xl backdrop-blur-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Gradient editor
          </p>

          {/* Card tabs */}
          <div className="mb-4 flex gap-1">
            {(Object.keys(gradients) as GradientKey[]).map((key) => (
              <button key={key} onClick={() => setActive(key)}
                className={`flex-1 rounded-md py-1 text-[10px] transition-colors ${
                  active === key ? "bg-white/20 text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}>
                {CARD_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Live swatch */}
          <div className="mb-4 h-10 w-full rounded-lg" style={stopToGradientStyle(stop)} />

          {/* Colors + angle row */}
          <div className="mb-4 flex gap-3">
            <label className="flex flex-col items-center gap-1 text-neutral-500">
              <span>From</span>
              <input type="color" value={stop.from}
                onChange={(e) => set({ from: e.target.value })}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent" />
            </label>
            <label className="flex flex-col items-center gap-1 text-neutral-500">
              <span>To</span>
              <input type="color" value={stop.to}
                onChange={(e) => set({ to: e.target.value })}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent" />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-neutral-500">
              <span className="flex justify-between">
                <span>Angle</span>
                <span className="text-neutral-400">{stop.angle}°</span>
              </span>
              <input type="range" min={0} max={360} value={stop.angle}
                onChange={(e) => set({ angle: Number(e.target.value) })}
                className="w-full accent-white" />
            </label>
          </div>

          {/* Stop position sliders — range extends to 250 to match Figma out-of-bounds handles */}
          <div className="flex flex-col gap-3">
            <Slider label="From position" value={stop.fromPos} min={-50} max={250} onChange={(v) => set({ fromPos: v })} />
            <Slider label="To position"   value={stop.toPos}   min={-50} max={250} onChange={(v) => set({ toPos: v })} />
          </div>

          <p className="mt-3 text-[10px] text-neutral-600">
            Paste values into DEFAULT_GRADIENTS to persist.
          </p>
        </div>
      )}
    </div>
  );
}