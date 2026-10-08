"use client";

import { heroVersions, type HeroVersion } from "./versions";

export function HeroVersionPicker({ current, onSelect }: { current: HeroVersion; onSelect: (id: string) => void }) {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full border border-white/15 bg-ink/80 p-1 text-[12px] text-white/70 backdrop-blur-md">
      <span className="px-2 text-white/40">Hero</span>
      {heroVersions.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onSelect(v.id)}
          title={v.label}
          className={`rounded-full px-3 py-1 transition-colors ${v.id === current.id ? "bg-violet text-white" : "hover:bg-white/10"}`}
        >
          {v.id} · {v.label}
        </button>
      ))}
    </div>
  );
}
