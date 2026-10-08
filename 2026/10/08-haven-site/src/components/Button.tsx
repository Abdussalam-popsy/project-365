import { DEMO_URL } from "@/content/site";

type Variant = "solid" | "outline" | "light";

const styles: Record<Variant, string> = {
  solid: "bg-violet text-white hover:bg-violet-soft",
  outline: "border border-current/40 hover:border-current",
  light: "bg-white text-ink hover:bg-lilac",
};

export function Button({
  children,
  href = DEMO_URL,
  variant = "solid",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex h-11 items-center justify-center px-6 text-[15px] font-medium transition-colors duration-200 ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
