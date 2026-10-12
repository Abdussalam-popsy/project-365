// Layout building blocks shared by every agent page.
import type { TitlePart, TitledText } from "@/content/agents/types";
import { Reveal } from "../Reveal";
import { TitleText } from "./TitleText";

type Surface = "mist" | "white" | "ink";
const surfaces: Record<Surface, string> = {
  mist: "bg-page text-ink",
  white: "bg-page text-ink",
  ink: "grain relative overflow-hidden bg-night text-white",
};

/** A full-width band with the site's standard padding and max width. */
export function Section({ id, surface = "mist", children }: { id?: string; surface?: Surface; children: React.ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-28 px-6 py-28 sm:py-32 ${surfaces[surface]}`}>
      <div className="relative mx-auto max-w-[1140px]">{children}</div>
    </section>
  );
}

interface IntroProps {
  /** Plain text, or pieces with `{ highlight: "…" }` for the accent colour. */
  title: string | TitlePart[];
  body?: string | string[];
  dark?: boolean;
  centered?: boolean;
}

/** Heading and one or two paragraphs. */
export function SectionIntro({ title, body, dark = false, centered = false }: IntroProps) {
  const paragraphs = body === undefined ? [] : Array.isArray(body) ? body : [body];
  return (
    <Reveal className={centered ? "mx-auto max-w-[760px] text-center" : "max-w-[620px]"}>
      <h2 className="text-[36px] leading-[1.06] font-light tracking-[-0.035em] sm:text-[48px]">
        <TitleText title={title} dark={dark} />
      </h2>
      {paragraphs.map((p) => (
        <p key={p} className={`mt-5 text-[17px] leading-relaxed ${dark ? "text-white/60" : "text-ink/60"}`}>
          {p}
        </p>
      ))}
    </Reveal>
  );
}

/** Text on one side, a visual on the other; `flip` puts the visual first on wide screens. */
export function Split({ text, visual, flip = false }: { text: React.ReactNode; visual: React.ReactNode; flip?: boolean }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <div className={flip ? "lg:order-2" : ""}>{text}</div>
      <Reveal delay={0.15} className={flip ? "lg:order-1" : ""}>
        {visual}
      </Reveal>
    </div>
  );
}

/** Numbered stage cards ("01 Intake", "02 Triage"…). */
export function StageGrid({ stages }: { stages: TitledText[] }) {
  return (
    <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage, i) => (
        <Reveal key={stage.title} delay={i * 0.05} className="h-full">
          <div className="flex h-full flex-col rounded-2xl border border-ink/[0.07] bg-white p-6">
            <span className="font-mono text-[13px] text-heather">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-6 text-[20px] tracking-[-0.01em]">{stage.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/55">{stage.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Features: a bordered grid with a looping tinted diagonal (see FeatureGrid.tsx). */
export { FeatureGrid } from "./FeatureGrid";
