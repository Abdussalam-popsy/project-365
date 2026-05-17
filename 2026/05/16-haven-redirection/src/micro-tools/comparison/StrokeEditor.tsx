import { useState } from "react";

const PRESETS = [
  { label: "Figma", value: "#d6d0c5" },
  { label: "Darker", value: "#c4a87a" },
  { label: "Dark", value: "#8a6c42" },
  { label: "Neutral", value: "#d4d4d4" },
  { label: "None", value: "transparent" },
];

export function StrokeEditor({
  color,
  onChange,
}: {
  color: string;
  onChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const displayValue = color === "transparent" ? "#000000" : color;

  return (
    <div className="fixed bottom-4 left-14 z-[110] font-mono text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900/60 text-white opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 hover:opacity-100"
        title="Table stroke editor"
      >
        ◈
      </button>

      {open && (
        <div className="absolute bottom-9 left-0 w-56 rounded-xl bg-neutral-900/90 p-4 shadow-xl backdrop-blur-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Table stroke
          </p>

          {/* Color picker */}
          <label className="mb-3 flex items-center gap-2 text-neutral-400">
            <input
              type="color"
              value={displayValue}
              onChange={(e) => onChange(e.target.value)}
              className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="text-neutral-500">{color}</span>
          </label>

          {/* Presets */}
          <div className="flex flex-col gap-1">
            {PRESETS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => onChange(value)}
                className={`flex items-center gap-2 rounded px-2 py-1 text-left transition-colors ${
                  color === value
                    ? "bg-white/15 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-sm border border-white/20"
                  style={{
                    background: value === "transparent" ? "none" : value,
                    borderStyle: value === "transparent" ? "dashed" : "solid",
                  }}
                />
                {label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[10px] text-neutral-600">
            Paste value into DEFAULT_STROKE to persist.
          </p>
        </div>
      )}
    </div>
  );
}
