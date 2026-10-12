/** Small down-pointing chevron, drawn in the current text colour. */
export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className={className}>
      <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Two-line menu icon that turns into an X when `open`. */
export function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d={open ? "M5 5l10 10M15 5L5 15" : "M3 7h14M3 13h14"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="transition-all duration-200"
      />
    </svg>
  );
}
