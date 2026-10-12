"use client";

import { motion } from "motion/react";
import type { TitlePart } from "@/content/agents/types";
import { demoUrl } from "@/content/site";
import { Button } from "../Button";
import { Eyebrow } from "../SectionHeading";

const ease = [0.16, 1, 0.3, 1] as const;

interface AgentHeroProps {
  eyebrow: string;
  title: TitlePart[];
  body: string;
  demoSubject: string;
  secondary: { label: string; href: string };
  /** The illustration on the right (stacks under the text on small screens). */
  visual: React.ReactNode;
}

/** Dark split hero: big headline with lilac highlights, two buttons, and a visual beside it. */
export function AgentHero({ eyebrow, title, body, demoSubject, secondary, visual }: AgentHeroProps) {
  return (
    <section className="grain relative overflow-hidden bg-night px-6 pt-40 pb-24 text-white sm:pt-48 sm:pb-32">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-[42px] leading-[1.03] font-light tracking-[-0.035em] sm:text-[60px] lg:text-[68px]">
            {title.map((part, i) =>
              typeof part === "string" ? part : <span key={i} className="text-lilac">{part.highlight}</span>,
            )}
          </h1>
          <p className="mt-7 max-w-[540px] text-lg leading-relaxed text-white/60 sm:text-xl">{body}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="light" href={demoUrl(demoSubject)}>
              Book a demo
            </Button>
            <Button variant="outline" href={secondary.href}>
              {secondary.label}
            </Button>
          </div>
        </motion.div>
        <div>{visual}</div>
      </div>
    </section>
  );
}
