import type { TitlePart } from "@/content/agents/types";
import { TitleText } from "./agent-page/TitleText";
import { Reveal } from "./Reveal";

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

interface SectionIntroProps {
  eyebrow?: string;
  /** Plain text, or pieces with `{ highlight: "…" }` in the accent colour. */
  title: string | TitlePart[];
  body?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

/**
 * The homepage's one section heading: eyebrow, heading and a line of body copy, at the same size everywhere so
 * sections read as one system. Wrapped in a Reveal so it fades up like the rest of the page.
 */
export function SectionIntro({ eyebrow, title, body, align = "left", dark = false, className = "" }: SectionIntroProps) {
  const centered = align === "center";
  return (
    <Reveal className={`${centered ? "mx-auto max-w-[760px] text-center" : "max-w-[680px]"} ${className}`}>
      {eyebrow && <Eyebrow tone={dark ? "dark" : "light"}>{eyebrow}</Eyebrow>}
      <h2 className={`${eyebrow ? "mt-4" : ""} text-[40px] leading-[1.05] font-light tracking-[-0.035em] sm:text-[52px]`}>
        <TitleText title={title} dark={dark} />
      </h2>
      {body && (
        <p className={`mt-5 text-[17px] leading-relaxed sm:text-lg ${dark ? "text-white/60" : "text-ink/55"} ${centered ? "mx-auto max-w-[620px]" : "max-w-[600px]"}`}>
          {body}
        </p>
      )}
    </Reveal>
  );
}
