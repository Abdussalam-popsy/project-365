"use client";

import { AnimatePresence, motion } from "motion/react";
import { firmCard, firmRules, scopeTones, scopeTrail, scopes, type FirmRule } from "@/content/firmContext";
import { Chip, DocIcon, MockCard, MockPanel } from "../agent-page/ui";

const ease = [0.16, 1, 0.3, 1] as const;

/** A rule is replaced when a rule with the same key is set at a deeper level that is already in view. */
const isReplaced = (rule: FirmRule, depth: number) =>
  rule.key !== undefined && firmRules.some((r) => r.key === rule.key && r.level > rule.level && r.level <= depth);

/** The scope trail: firm → portfolio → property → unit, lit up to the current depth. */
function ScopeTrail({ depth }: { depth: number }) {
  return (
    <ol className="mb-5 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[13px]">
      {scopeTrail.map((name, i) => (
        <li key={name} className="flex items-center gap-1.5">
          {i > 0 && (
            <span aria-hidden className={`transition-colors duration-500 ${i <= depth ? "text-heather/60" : "text-ink/20"}`}>
              ›
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 transition-colors duration-500 ${i <= depth ? "bg-white text-heather shadow-[0_6px_16px_-10px_rgba(30,15,38,0.4)]" : "text-ink/35"}`}
          >
            {name}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Everything the agent knows about WO-9002 at a given depth: the firm's rules first, then each narrower scope's
 * additions. A rule a narrower scope replaces stays visible but struck through, so the override reads at a glance.
 */
export function FirmContextCard({ depth }: { depth: number }) {
  const visible = firmRules.filter((r) => r.level <= depth);
  const applying = visible.filter((r) => !isReplaced(r, depth)).length;
  return (
    <MockPanel className="mock-compact lg:min-h-[590px] pb-[72px] sm:pb-[76px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[14px] font-medium text-ink/80">{firmCard.title}</span>
        <span className="text-[13px] text-ink/45">{firmCard.record}</span>
      </div>
      <ScopeTrail depth={depth} />
      <MockCard className="px-5 py-2">
        <ul>
          <AnimatePresence initial={false}>
            {visible.map((rule) => {
              const replaced = isReplaced(rule, depth);
              return (
                <motion.li
                  key={rule.text}
                  layout="position"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 border-b border-ink/[0.06] py-3">
                    <DocIcon />
                    <span
                      className={`mr-auto text-[15px] transition-all duration-500 ${replaced ? "text-ink/35 line-through decoration-ink/30" : "text-ink/85"}`}
                    >
                      {rule.text}
                    </span>
                    {replaced ? (
                      <span className="text-[12px] whitespace-nowrap text-ink/40">Replaced</span>
                    ) : (
                      <Chip chip={{ label: scopes[rule.level].title, tone: scopeTones[rule.level] }} />
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        <p className="py-3 text-[13px] text-ink/45">
          {applying} rules apply · the most specific one wins
        </p>
      </MockCard>
    </MockPanel>
  );
}
