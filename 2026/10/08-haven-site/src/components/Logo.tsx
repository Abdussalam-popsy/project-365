export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[22px] font-medium tracking-[-0.04em] ${className}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path d="M3 2v18M3 11h11M14 11v9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
        <rect x="16.5" y="2" width="3.5" height="3.5" fill="currentColor" />
      </svg>
      haven
    </span>
  );
}
