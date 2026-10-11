"use client";

import { useState } from "react";
import { heroVersions, type HeroVersion } from "./versions";

interface HeroVersionPickerProps {
  current: HeroVersion;
  onSelect: (id: string) => void;
}

const activeVersions = heroVersions.filter((v) => !v.archived);
const archivedVersions = heroVersions.filter((v) => v.archived);

export function HeroVersionPicker({ current, onSelect }: HeroVersionPickerProps) {
  const [showArchive, setShowArchive] = useState(false);
  // A `?hero=` link to an archived version keeps that one button visible even with the archive closed.
  const visible = showArchive
    ? [...activeVersions, ...archivedVersions]
    : [...activeVersions, ...(current.archived ? [current] : [])];

  return (
    <div className="fixed right-20 bottom-4 z-50 flex max-w-[calc(100vw-6rem)] flex-wrap items-center gap-1 rounded-full border border-white/15 bg-ink/80 p-1 text-[12px] text-white/70 backdrop-blur-md">
      <span className="px-2 text-white/40">Hero</span>
      {visible.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onSelect(v.id)}
          title={v.label}
          className={`rounded-full px-3 py-1 transition-colors ${v.id === current.id ? "bg-violet text-white" : "hover:bg-white/10"} ${v.archived ? "text-white/40" : ""}`}
        >
          {v.id} · {v.label}
        </button>
      ))}
      {archivedVersions.length > 0 && (
        <button
          type="button"
          onClick={() => setShowArchive((open) => !open)}
          aria-expanded={showArchive}
          className="rounded-full border border-white/10 px-3 py-1 text-white/40 transition-colors hover:bg-white/10"
        >
          {showArchive ? "Hide archive" : `Archive (${archivedVersions.length})`}
        </button>
      )}
    </div>
  );
}
