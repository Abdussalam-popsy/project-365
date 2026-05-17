import { useState } from "react";
import { motion } from "motion/react";
import { StrokeEditor } from "@/micro-tools/comparison/StrokeEditor";

// ─── Tune this once you've found your preferred stroke ────────────────────────
const DEFAULT_STROKE = "#e8d5b3";

// ─── Data ─────────────────────────────────────────────────────────────────────
const WITHOUT_STEPS = [
  "Resident calls. Phone rings out.",
  "Staff manually logs the call and creates a work order.",
  "Coordinator emails the vendor, waits for a reply.",
  "Resident follows up two days later.",
  "Staff updates the PMS at end of day if they remember.",
  "Manager reviews a pile of missed calls on Monday morning.",
];

const WITH_STEPS = [
  "Haven answers. Every time.",
  "Haven logs the call and creates the work order automatically.",
  "Haven contacts the vendor, schedules the appointment, sends confirmation.",
  "Resident gets a confirmation within minutes.",
  "PMS is updated in real time. No double entry.",
  "Manager opens the PMS. Everything is already there.",
];

const RED   = "#ea0b0b";
const GREEN = "#08ad0e";

// ─── Animation variants ───────────────────────────────────────────────────────
const rowVariants = {
  hidden:  { opacity: 0, y: 8, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const leftColVariants  = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const rightColVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };

// ─── Number badge — solid square ─────────────────────────────────────────────
function Badge({ n, color }: { n: number; color: string }) {
  return (
    <span
      className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-sm leading-none text-white"
      style={{ background: color }}
    >
      {n}
    </span>
  );
}

// ─── One column ───────────────────────────────────────────────────────────────
interface ColumnProps {
  title:    string;
  steps:    string[];
  footer:   string;
  color:    string;
  stroke:   string;
  variants: typeof leftColVariants;
}

function Column({ title, steps, footer, color, stroke, variants }: ColumnProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="flex flex-col"
    >
      <motion.div
        variants={rowVariants}
        className="p-3"
        style={{ borderBottom: `1px solid ${stroke}` }}
      >
        <p className="text-2xl font-semibold leading-none tracking-[-0.02em] text-black">
          {title}
        </p>
      </motion.div>

      {steps.map((step, i) => (
        <motion.div
          key={i}
          variants={rowVariants}
          className="flex items-center gap-2 p-3"
          style={{ borderBottom: `1px solid ${stroke}` }}
        >
          <Badge n={i + 1} color={color} />
          <p className="text-base leading-[1.3] tracking-[-0.04em] text-black">
            {step}
          </p>
        </motion.div>
      ))}

      <motion.div
        variants={rowVariants}
        className="mt-4 flex items-center p-3"
        style={{ background: color }}
      >
        <p className="font-mono text-base uppercase tracking-[-0.02em] text-white">
          {footer}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function ComparisonSection() {
  const [stroke, setStroke] = useState(DEFAULT_STROKE);

  // CSS custom property drives the responsive column divider via a scoped style tag.
  // On mobile (flex-col): left col gets border-bottom.
  // On desktop (flex-row lg:): left col gets border-right instead.
  const strokeVar = { "--comparison-stroke": stroke } as React.CSSProperties;

  return (
    <section className="w-full bg-cream px-5 py-[72px] sm:px-10 lg:px-20">
      <style>{`
        .comparison-col-divider { border-bottom: 1px solid var(--comparison-stroke); }
        @media (min-width: 1024px) {
          .comparison-col-divider { border-bottom: none; border-right: 1px solid var(--comparison-stroke); }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10">
        {/* Heading */}
        <h2 className="text-center text-[40px] font-semibold leading-[1.1] tracking-[-0.05em] text-neutral-900">
          Your team shouldn't be the system.
        </h2>

        {/* Comparison table */}
        <div
          className="flex flex-col lg:flex-row"
          style={{ ...strokeVar, border: `1px solid ${stroke}` }}
        >
          {/* Without Haven — flex-1 ensures equal width with the right column */}
          <div className="comparison-col-divider flex-1">
            <Column
              title="Without Haven"
              steps={WITHOUT_STEPS}
              footer="Spend hours and waste time"
              color={RED}
              stroke={stroke}
              variants={leftColVariants}
            />
          </div>

          {/* With Haven */}
          <div className="flex-1">
            <Column
              title="With Haven"
              steps={WITH_STEPS}
              footer="Your agent works in real time"
              color={GREEN}
              stroke={stroke}
              variants={rightColVariants}
            />
          </div>
        </div>
      </div>

      {import.meta.env.DEV && (
        <StrokeEditor color={stroke} onChange={setStroke} />
      )}
    </section>
  );
}
