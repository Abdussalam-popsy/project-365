"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { problem, type ProblemPart } from "@/content/site";
import { FloatingCards } from "./problem/FloatingCards";
import { ProblemIcon } from "./problem/ProblemIcon";

type Tone = "base" | "accent" | "muted";
type IconName = "moon" | "call" | "stack";
/**
 * One revealable word; each fades in as you scroll past its share of the section. A phrase's icon rides on
 * its first word, so the two always wrap onto the same line.
 */
type Token = { text: string; tone: Tone; icon?: IconName };

const words = (text: string, tone: Tone): Token[] => text.split(" ").map((w) => ({ text: w, tone }));

function tokensOf(part: ProblemPart): Token[] {
  if (typeof part === "string") return words(part, "base");
  if ("muted" in part) return words(part.muted, "muted");
  const [first, ...rest] = words(part.text, "accent");
  return [{ ...first, icon: part.icon }, ...rest];
}

/** Final colour of each word once revealed: ink, the light-section highlight purple, or a soft grey for the closing line. */
const toneClass: Record<Tone, string> = { base: "text-ink", accent: "text-orchid", muted: "text-ink/40" };

/**
 * The homepage problem statement, dub.co style: short paragraphs, key phrases in orchid led by small animated
 * icon tiles, floating mock cards either side, and a faint dot grid. Words (and icons) still light up one by one
 * as you scroll, the way the original single paragraph did.
 */
export function ProblemStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
  const paragraphs = problem.map((p) => p.flatMap(tokensOf));
  const total = paragraphs.reduce((n, p) => n + p.length, 0);
  let index = 0;

  return (
    <section ref={ref} className="relative overflow-hidden bg-page px-6 py-32 sm:py-44">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(30,15,38,0.09)_1px,transparent_1.2px)] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)] bg-[size:22px_22px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1240px]">
        <FloatingCards />
        <div className="mx-auto flex max-w-[760px] flex-col gap-8 text-[28px] leading-[1.25] font-light tracking-[-0.02em] sm:text-[40px]">
          {paragraphs.map((tokens, p) => (
            <p key={p}>
              {tokens.map((token) => {
                const i = index++;
                const range: [number, number] = [i / total, (i + 1) / total];
                return (
                  <Reveal key={i} progress={scrollYProgress} range={range} className={`mr-[0.25em] whitespace-nowrap ${toneClass[token.tone]}`}>
                    {token.icon && <ProblemIcon name={token.icon} />}
                    {token.icon && " "}
                    {token.text}
                  </Reveal>
                );
              })}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reveal({
  children,
  progress,
  range,
  className = "",
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className={`inline-block ${className}`}>
      {children}
    </motion.span>
  );
}
