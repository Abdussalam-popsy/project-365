export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[13px] font-medium uppercase tracking-[0.14em] text-violet ${className}`}>{children}</p>
  );
}
