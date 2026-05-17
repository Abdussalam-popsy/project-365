import { useState } from "react";

const PRESETS = [
  { label: "Subtle",   value: 0.7 },
  { label: "Medium",   value: 0.5 },
  { label: "Strong",   value: 0.3 },
  { label: "Dramatic", value: 0.15 },
  { label: "None",     value: 1.0 },
];

export function VignetteEditor({
  inactiveOpacity,
  onOpacityChange,
}: {
  inactiveOpacity: number;
  onOpacityChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-28 z-[110] font-mono text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900/60 text-white opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 hover:opacity-100"
        title="Testimonial vignette editor"
      >
        ◎
      </button>

      {open && (
        <div className="absolute bottom-9 left-0 w-60 rounded-xl bg-neutral-900/90 p-4 shadow-xl backdrop-blur-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Inactive card opacity
          </p>

          {/* Slider */}
          <label className="mb-3 flex items-center gap-2 text-neutral-400">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={inactiveOpacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="h-1 w-full cursor-pointer accent-white"
            />
            <span className="w-8 shrink-0 text-right text-neutral-300">
              {Math.round(inactiveOpacity * 100)}%
            </span>
          </label>

          {/* Presets */}
          <div className="flex flex-col gap-1">
            {PRESETS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => onOpacityChange(value)}
                className={`flex items-center justify-between rounded px-2 py-1 text-left transition-colors ${
                  Math.abs(inactiveOpacity - value) < 0.01
                    ? "bg-white/15 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span>{label}</span>
                <span className="text-neutral-600">{Math.round(value * 100)}%</span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-[10px] text-neutral-600">
            Paste value into DEFAULT_INACTIVE_OPACITY to persist.
          </p>
        </div>
      )}
    </div>
  );
}
