// Small shared pieces for the agent pages: status chips, the document icon, and the rounded mock panel.
import type { Chip as ChipData, ChipTone } from "@/content/agents/types";

/** Soft fills with darker text, so status reads at a glance without leaving the muted palette. */
const chipTones: Record<ChipTone, string> = {
  red: "bg-[#f6e4e6] text-[#9b4f5a]",
  amber: "bg-[#f6ecd9] text-[#8a6326]",
  green: "bg-[#e3efe7] text-[#4c7a5c]",
  violet: "bg-[#ece4f3] text-plum-800",
  neutral: "bg-ink/[0.05] text-ink/55",
};

/** `onDark`: the neutral chip's faint grey would vanish on ink, so it gets a light-on-dark version. */
export function Chip({ chip, onDark = false, className = "" }: { chip: ChipData; onDark?: boolean; className?: string }) {
  const tone = onDark && chip.tone === "neutral" ? "bg-white/10 text-white/65" : chipTones[chip.tone];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] leading-none font-medium whitespace-nowrap ${tone} ${className}`}>
      {chip.label}
    </span>
  );
}

export function DateChip({ date }: { date: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-ink/[0.05] px-2 py-1 text-[12px] leading-none text-ink/50">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="4.75" stroke="currentColor" strokeWidth="1.1" />
        <path d="M6 3.5V6l1.6 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
      {date}
    </span>
  );
}

export function DocIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={`shrink-0 text-ink/40 ${className}`}>
      <path d="M4 1.75h5.25L12.5 5v9.25H4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9 1.75V5.25h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/** The soft rounded tray the client's mocks sit in. */
export function MockPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[28px] bg-tray p-5 sm:p-8 ${className}`}>{children}</div>;
}

/** A white rounded card used inside mock panels. */
export function MockCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink/[0.06] bg-white shadow-[0_18px_40px_-24px_rgba(30,15,38,0.35)] ${className}`}>
      {children}
    </div>
  );
}

/** The translucent frame hero visuals sit in, on the dark hero. */
export function HeroPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-5 sm:p-8 ${className}`}>{children}</div>;
}
