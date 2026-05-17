import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { PixelIcon } from "./agents/PixelIcon";
import { AGENT_COLOR, type AgentId } from "./agents/pixel-icons";

// ─── Autoplay duration — change this to tune the interval ─────────────────────
export const AUTOPLAY_MS = 10_000;

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

const SECTION_HEADING = (
  <>
    One platform. Three agents.
    <br />
    Every operation covered.
  </>
);

// ─── Card illustration (desktop) ─────────────────────────────────────────────
function AgentIllustration({ id }: { id: AgentId }) {
  return (
    <div className="flex h-full w-full items-center justify-center pb-36">
      <PixelIcon agentId={id} size={160} />
    </div>
  );
}

// ─── Autoplay hook ────────────────────────────────────────────────────────────
// Advances activeIdx every durationMs while enabled and not paused.
// Pause/resume tracks elapsed time so progress is accurate after scroll-back.
function useAgentAutoplay({
  count,
  activeIdx,
  setActiveIdx,
  enabled,
  paused,
  durationMs,
}: {
  count: number;
  activeIdx: number;
  setActiveIdx: React.Dispatch<React.SetStateAction<number>>;
  enabled: boolean;
  paused: boolean;
  durationMs: number;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const accumulatedMs = useRef(0); // ms of active display time for current agent
  const runStartRef = useRef<number | null>(null); // Date.now() when last resumed

  function clear() {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }

  // Reset accumulated time whenever the agent changes (tap or auto-advance)
  useEffect(() => {
    accumulatedMs.current = 0;
    runStartRef.current = null;
  }, [activeIdx]);

  // Start / pause / resume
  useEffect(() => {
    clear();
    const shouldRun = enabled && !paused;

    if (!shouldRun) {
      // Save elapsed so we can resume from here
      if (runStartRef.current !== null) {
        accumulatedMs.current += Date.now() - runStartRef.current;
        runStartRef.current = null;
      }
      return;
    }

    runStartRef.current = Date.now();
    const remaining = Math.max(0, durationMs - accumulatedMs.current);

    timerRef.current = setTimeout(() => {
      accumulatedMs.current = 0;
      runStartRef.current = null;
      setActiveIdx((prev) => (prev + 1) % count);
    }, remaining);

    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, paused, activeIdx]);

  // Cleanup on unmount
  useEffect(() => () => clear(), []);
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function AgentsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const agent = AGENTS[activeIdx];

  // ── IntersectionObserver — pause when section fully off-screen ────────────
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }, // isIntersecting = false only when fully off-screen
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Mobile detection (lg breakpoint = 1024px) ─────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const prefersReduced = useReducedMotion();
  const autoplayEnabled = isMobile && !prefersReduced;
  // CSS animation-play-state for the progress fill
  const fillRunning = autoplayEnabled && inView;

  useAgentAutoplay({
    count: AGENTS.length,
    activeIdx,
    setActiveIdx,
    enabled: autoplayEnabled,
    paused: !inView,
    durationMs: AUTOPLAY_MS,
  });

  return (
    <section
      ref={sectionRef}
      className="w-full bg-cream px-5 py-[72px] sm:px-10 lg:px-20"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        {/* ══════════════════════════════════════════════════════════════════════
            MOBILE LAYOUT  (hidden on lg+)
            Structure: heading → tab strip → animated card
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-8 lg:hidden">
          {/* Heading */}
          <h2 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.05em] text-neutral-900">
            {SECTION_HEADING}
          </h2>

          {/* Tab strip — pill buttons with progress fill on active */}
          <div className="flex flex-wrap gap-2 pb-1">
            {AGENTS.map((a, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={a.id}
                  onClick={() => setActiveIdx(i)}
                  className="relative shrink-0 overflow-hidden rounded-[8px] px-4 py-2 text-sm font-semibold leading-none tracking-[-0.02em] transition-colors duration-200"
                  style={{
                    background: isActive
                      ? AGENT_COLOR[a.id]
                      : "rgba(0,0,0,0.06)",
                    color: isActive ? "white" : "rgba(0,0,0,0.4)",
                  }}
                >
                  {/* Progress fill — sweeps left→right over AUTOPLAY_MS */}
                  {isActive && (
                    <span
                      key={`fill-${activeIdx}`}
                      aria-hidden
                      className="absolute inset-y-0 left-0 rounded-[8px]"
                      style={{
                        background: "rgba(255,255,255,0.38)",
                        width: "0%",
                        animationName: "agent-progress",
                        animationDuration: `${AUTOPLAY_MS}ms`,
                        animationTimingFunction: "linear",
                        animationFillMode: "forwards",
                        animationPlayState: fillRunning ? "running" : "paused",
                      }}
                    />
                  )}
                  {/* Label sits above the fill */}
                  <span className="relative z-10">{a.name}</span>
                </button>
              );
            })}
          </div>

          {/* Animated card — icon + name + description + tags */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{ background: "#e8d5b3" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-6 px-6 pb-6 pt-8"
              >
                <PixelIcon agentId={agent.id} size={120} />

                <div className="flex w-full flex-col gap-3">
                  <p className="text-xl font-semibold leading-none tracking-[-0.02em] text-black">
                    {agent.name}
                  </p>
                  <p className="text-sm leading-[1.4] tracking-[-0.03em] text-black/65">
                    {agent.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {agent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-3 py-1.5 text-xs leading-[1.3] tracking-[-0.03em] text-black"
                        style={{ background: "rgba(255,255,255,0.4)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            DESKTOP LAYOUT  (hidden below lg)
            Structure: left column (heading + selector + description) | right card
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="hidden items-stretch justify-between lg:flex">
          {/* Left: heading + agent selector + description */}
          <div className="flex flex-1 flex-col justify-between pr-10">
            <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.05em] text-neutral-900">
              {SECTION_HEADING}
            </h2>

            <div className="flex flex-col gap-6">
              {/* Agent name list */}
              <div className="flex flex-col gap-4">
                {AGENTS.map((a, i) => (
                  <button
                    key={a.name}
                    onClick={() => setActiveIdx(i)}
                    className="text-left text-2xl font-semibold leading-none tracking-[-0.02em] transition-colors duration-200"
                    style={{
                      color: i === activeIdx ? "#000" : "rgba(0,0,0,0.3)",
                    }}
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

          {/* Right: agent card */}
          <div
            className="relative flex-shrink-0 overflow-hidden rounded-lg"
            style={{ width: 529, height: 403, background: "#e8d5b3" }}
          >
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

            {/* Tags overlay */}
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
      </div>
    </section>
  );
}
