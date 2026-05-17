import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PixelIcon } from "./agents/PixelIcon";
import type { AgentId } from "./agents/pixel-icons";

// ─── Agent data ───────────────────────────────────────────────────────────────
type Agent = {
  id: AgentId;
  name: string;
  description: string;
  tags: string[];
};

const AGENTS: Agent[] = [
  {
    id: "frontline",
    name: "Frontline Receptionist",
    description:
      "Answers every inbound call, triages and routes it, captures structured information, and logs it directly into your PMS — 24/7, without missing a beat.",
    tags: [
      "After-hours calls",
      "Resident inquiries and complaints",
      "Emergency triage and escalation",
      "Call logging and note creation",
    ],
  },
  {
    id: "maintenance",
    name: "Maintenance Coordinator",
    description:
      "Reads work orders from your PMS, contacts residents and vendors, schedules appointments, sends updates, and escalates complex situations to staff.",
    tags: [
      "Work order creation and tracking",
      "Vendor outreach and scheduling",
      "Resident status updates",
      "Exception escalation with context",
    ],
  },
  {
    id: "leasing",
    name: "Leasing Agent",
    description:
      "Responds instantly to new leads via phone, text, and email. Answers questions using your listings and policies, schedules tours, and keeps your PMS up to date.",
    tags: [
      "Instant lead response",
      "Tour scheduling",
      "FAQ handling from listings and policies",
      "Lead status updates in PMS",
    ],
  },
];

// ─── Card illustration ────────────────────────────────────────────────────────
function AgentIllustration({ id }: { id: AgentId }) {
  return (
    // Offset bottom padding so icon sits in the visual space above the tag overlay
    <div className="flex h-full w-full items-center justify-center pb-36">
      <PixelIcon agentId={id} size={160} />
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function AgentsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const agent = AGENTS[activeIdx];

  return (
    <section className="w-full bg-cream px-5 py-[72px] sm:px-10 lg:px-20">
      <div className="mx-auto flex w-full max-w-[1280px] items-stretch justify-between">

        {/* ── Left: heading + agent selector + description ── */}
        <div className="flex flex-col justify-between" style={{ width: 495 }}>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.05em] text-neutral-900">
            One platform. Three agents.{" "}
            <br />
            Every operation covered.
          </h2>

          <div className="flex flex-col gap-6">
            {/* Agent name list */}
            <div className="flex flex-col gap-4">
              {AGENTS.map((a, i) => (
                <button
                  key={a.name}
                  onClick={() => setActiveIdx(i)}
                  className="text-left text-2xl font-semibold leading-none tracking-[-0.02em] transition-colors duration-200"
                  style={{ color: i === activeIdx ? "#000" : "rgba(0,0,0,0.3)" }}
                >
                  {a.name}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-black/10" />

            {/* Description — animates on agent switch */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="text-base leading-[1.3] tracking-[-0.04em] text-black"
              >
                {agent.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: agent card ── */}
        <div
          className="relative overflow-hidden rounded-lg"
          style={{ width: 529, height: 403, background: "#e8d5b3" }}
        >
          {/* Illustration area — placeholder until per-agent visuals are ready */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <AgentIllustration id={agent.id} />
            </motion.div>
          </AnimatePresence>

          {/* Tags overlay — slides in on agent switch */}
          <div className="absolute bottom-0 left-0 w-full p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4"
              >
                <p className="text-2xl font-semibold leading-none tracking-[-0.02em] text-black">
                  {agent.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-4 py-2 text-xs leading-[1.3] tracking-[-0.04em] text-black"
                      style={{ background: "rgba(255,255,255,0.3)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
