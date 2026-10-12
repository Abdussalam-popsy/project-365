interface EyebrowProps {
  children: React.ReactNode;
  /** "dark" for eyebrows on ink sections: lilac instead of violet, which clashes with the dark plum. */
  tone?: "light" | "dark";
  className?: string;
}

export function Eyebrow({ children, tone = "light", className = "" }: EyebrowProps) {
  const color = tone === "dark" ? "text-lilac" : "text-heather";
  return <p className={`text-[13px] font-medium uppercase tracking-[0.14em] ${color} ${className}`}>{children}</p>;
}
