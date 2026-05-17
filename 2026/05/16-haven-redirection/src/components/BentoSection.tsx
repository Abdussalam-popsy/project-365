import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  RiWhatsappFill,
  RiMailFill,
  RiChat3Fill,
  RiChatVoiceFill,
  RiAddCircleFill,
  RiRefreshFill,
  RiCheckboxFill,
} from "@remixicon/react";
import { GradientEditor } from "@/micro-tools/gradient/GradientEditor";
import { SyncIllustration } from "./sync/SyncIllustration";
import {
  type GradientKey,
  type GradientMap,
  type Stop,
  stopToGradientStyle,
} from "@/micro-tools/gradient/types";

// ─── Gradient config ──────────────────────────────────────────────────────────
// Positions are % and can exceed 100 to push the blend outside the card boundary.
// Live-edit with the ✦ button (bottom-left, hidden until hovered).
// Once happy, paste values back into DEFAULT_GRADIENTS to persist.

const DEFAULT_GRADIENTS: GradientMap = {
  receive: { from: "#c1cfca", fromPos: -50, to: "#032742", toPos: 73,  angle: 180 },
  sops:    { from: "#75927f", fromPos: 24,  to: "#232c28", toPos: 151, angle: 180 },
  pms:     { from: "#d86e40", fromPos: 38,  to: "#723a22", toPos: 123, angle: 180 },
};

// ─── Shared card text ─────────────────────────────────────────────────────────
function CardText({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-4 p-4 text-white">
      <p className="text-2xl font-semibold leading-none tracking-[-0.03em]">{title}</p>
      {/* mix-blend-screen + opacity-70 per Figma spec */}
      <p className="text-base leading-[1.3] tracking-[-0.04em] opacity-70 mix-blend-screen">
        {body}
      </p>
    </div>
  );
}

// ─── Card 1: Receive every request ───────────────────────────────────────────
const CHANNELS = [
  { Icon: RiWhatsappFill,  name: "WhatsApp" },
  { Icon: RiMailFill,      name: "Email" },
  { Icon: RiChat3Fill,     name: "Message" },
  { Icon: RiChatVoiceFill, name: "Audio" },
] as const;

const ICON_SIZE = 48;
const ICON_GAP  = 8;

function tileStyle(active: boolean): React.CSSProperties {
  return {
    width:          ICON_SIZE,
    height:         ICON_SIZE,
    flexShrink:     0,
    borderRadius:   10,
    border:         `1px solid rgba(255,255,255,${active ? "0.28" : "0.14"})`,
    background:     "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.07) 100%)",
    boxShadow:      "inset 0 1px 0 rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    color:          "white",
    transition:     "border-color 150ms ease",
  };
}

function ReceiveIllustration() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex h-[236px] flex-col items-center justify-center gap-3">
      {/* Tooltip — space always reserved so layout never shifts */}
      <div className="flex h-5 items-center">
        <span
          className="rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/80"
          style={{
            opacity:        hovered ? 1 : 0,
            transition:     "opacity 120ms ease",
            background:     "rgba(255,255,255,0.12)",
            backdropFilter: "blur(6px)",
            border:         "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {hovered ?? "\u00A0"}
        </span>
      </div>

      {/* Dock bar */}
      <div
        className="rounded-2xl p-2"
        style={{
          background:     "rgba(255,255,255,0.07)",
          border:         "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)",
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="flex items-center" style={{ gap: ICON_GAP }}>
          {CHANNELS.map(({ Icon, name }) => (
            <div
              key={name}
              style={tileStyle(hovered === name)}
              onMouseEnter={() => setHovered(name)}
            >
              <Icon size={Math.round(ICON_SIZE * 0.4)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Card 2: Act on your SOPs ─────────────────────────────────────────────────
// soft-blur-in adapted per-word (pixel-point/animate-text):
//   enter: opacity 0→1, y 8→0px, blur 6→0px
//   easing: cubic-bezier(0.22, 1, 0.36, 1), duration 600ms, stagger 100ms/word

const SOPS_STEPS = [
  { label: "Adding to PMS",       Icon: RiAddCircleFill },
  { label: "Syncing to PMS",      Icon: RiRefreshFill   },
  { label: "Confirmed & Secured", Icon: RiCheckboxFill  },
] as const;

const SOPS_ICON_SIZE = 36;
const LINE_H         = 30;
const LINE_MS        = 360;
const WORD_STAGGER   = 100; // ms between words
const WORD_DUR       = 600; // ms per word animation

type StepState = "hidden" | "animating" | "done";

function SopsIllustration() {
  const [stepStates, setStepStates] = useState<StepState[]>(["done", "done", "done"]);
  const [animKeys,   setAnimKeys]   = useState([0, 0, 0]);
  const [lineDrawn,  setLineDrawn]  = useState([true, true]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clear() { timers.current.forEach(clearTimeout); timers.current = []; }
  function after(fn: () => void, ms: number) { timers.current.push(setTimeout(fn, ms)); }

  function runAnimation() {
    clear();
    setStepStates(["hidden", "hidden", "hidden"]);
    setLineDrawn([false, false]);

    let t = 120;

    SOPS_STEPS.forEach((step, si) => {
      const wordCount  = step.label.split(" ").length;
      const wordsDone  = (wordCount - 1) * WORD_STAGGER + WORD_DUR; // last word fully settled

      // Activate step — bump animKey so motion.spans remount with fresh initial
      after(() => {
        setStepStates(prev => { const n = [...prev]; n[si] = "animating"; return n; });
        setAnimKeys(prev => { const n = [...prev]; n[si] = n[si] + 1; return n; });
      }, t);

      t += wordsDone + 260;

      // Mark done (icon stays bright, no visual change — just state cleanup)
      after(() => setStepStates(prev => { const n = [...prev]; n[si] = "done"; return n; }), t);

      // Draw connector line
      if (si < SOPS_STEPS.length - 1) {
        after(() => setLineDrawn(prev => { const n = [...prev]; n[si] = true; return n; }), t);
        t += LINE_MS + 100;
      }
    });
  }

  useEffect(() => () => clear(), []);

  return (
    <div className="flex h-[236px] items-center pl-8" onMouseEnter={runAnimation}>
      <div className="flex flex-col">
        {SOPS_STEPS.map((step, si) => {
          const ss     = stepStates[si];
          const active = ss === "animating" || ss === "done";
          const words  = step.label.split(" ");
          const { Icon } = step;

          return (
            <div key={si}>
              {/* Step row */}
              <div className="flex items-center gap-3">
                {/* Glass icon tile — animates in with the words */}
                <motion.div
                  key={`icon-${animKeys[si]}`}
                  initial={ss === "animating" ? { opacity: 0, y: 8, filter: "blur(6px)" } : false}
                  animate={{
                    opacity: ss === "hidden" ? 0 : 1,
                    y:       0,
                    filter:  "blur(0px)",
                  }}
                  transition={ss === "animating"
                    ? { duration: WORD_DUR / 1000, ease: [0.22, 1, 0.36, 1] }
                    : { duration: 0.12 }
                  }
                  style={{
                    width: SOPS_ICON_SIZE, height: SOPS_ICON_SIZE, flexShrink: 0,
                    borderRadius:   10,
                    border:         `1px solid rgba(255,255,255,${active ? 0.28 : 0.12})`,
                    background:     "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.07) 100%)",
                    boxShadow:      "inset 0 1px 0 rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color:      `rgba(255,255,255,${active ? 1 : 0.3})`,
                    transition: "border-color 300ms ease, color 300ms ease",
                  }}
                >
                  <Icon size={Math.round(SOPS_ICON_SIZE * 0.44)} />
                </motion.div>

                {/* 3-line text block */}
                <div className="flex flex-col gap-px">
                  {/* Line 1 — soft-blur-in per word */}
                  <p
                    className="text-sm font-medium leading-none tracking-[-0.04em]"
                    style={{ color: active ? "white" : "rgba(255,255,255,0.3)", transition: "color 300ms ease" }}
                  >
                    {words.map((word, wi) => (
                      <motion.span
                        key={`${animKeys[si]}-${wi}`}
                        // initial only applies on mount — triggered by animKey bump
                        initial={ss === "animating" ? { opacity: 0, y: 8, filter: "blur(6px)" } : false}
                        animate={{
                          opacity: ss === "hidden" ? 0 : 1,
                          y:       0,
                          filter:  "blur(0px)",
                        }}
                        transition={ss === "animating"
                          ? { delay: wi * (WORD_STAGGER / 1000), duration: WORD_DUR / 1000, ease: [0.22, 1, 0.36, 1] }
                          : { duration: 0.12 }
                        }
                        style={{ display: "inline-block", marginRight: wi < words.length - 1 ? "0.3em" : 0 }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </p>

                  {/* Line 2 — person & action */}
                  <p
                    className="text-[11px] leading-tight tracking-[-0.03em] text-white/40"
                    style={{ opacity: active ? 1 : 0, transition: "opacity 350ms ease 120ms" }}
                  >
                    Andrew P. · Inbound enquiry
                  </p>

                  {/* Line 3 — date & time */}
                  <p
                    className="text-[11px] leading-tight tracking-[-0.03em] text-white/25"
                    style={{ opacity: active ? 1 : 0, transition: "opacity 350ms ease 240ms" }}
                  >
                    Monday, 12 Oct 2026 · 2:00 PM
                  </p>
                </div>
              </div>

              {/* Connector line — draws downward */}
              {si < SOPS_STEPS.length - 1 && (
                <div style={{ marginLeft: SOPS_ICON_SIZE / 2 - 0.5, height: LINE_H, width: 1, overflow: "hidden" }}>
                  <div style={{
                    width:      "100%",
                    height:     lineDrawn[si] ? "100%" : "0%",
                    background: "rgba(255,255,255,0.22)",
                    transition: `height ${LINE_MS}ms linear`,
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Card 3: Sync back to PMS — see ./sync/SyncIllustration.tsx ──────────────


// ─── Main section ─────────────────────────────────────────────────────────────

export function BentoSection() {
  const [gradients, setGradients] = useState<GradientMap>(DEFAULT_GRADIENTS);

  const update = (key: GradientKey, stop: Stop) =>
    setGradients((prev) => ({ ...prev, [key]: stop }));

  const cards = [
    {
      key: "receive" as GradientKey,
      illustration: <ReceiveIllustration />,
      title: "Receive every request",
      body: "Haven picks up every inbound interaction 24/7 across every channel your residents and owners already use.",
    },
    {
      key: "sops" as GradientKey,
      illustration: <SopsIllustration />,
      title: "Act on your SOPs",
      body: "It follows your rules, your escalation paths, and your SLAs and loops in your team only when it has to.",
    },
    {
      key: "pms" as GradientKey,
      illustration: <SyncIllustration />,
      title: "Sync back to your PMS",
      body: "Every action, note, and update goes straight into your property management software.",
    },
  ];

  return (
    <section className="w-full bg-cream px-5 py-[72px] sm:px-10 lg:px-20">
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.05em] text-neutral-900">
            Everything you need
          </h2>
          <button className="rounded-[8px] bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700">
            Book a demo
          </button>
        </div>

        {/* Bento grid — stacks to single column on mobile */}
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
          {cards.map(({ key, illustration, title, body }) => (
            <div
              key={key}
              className="flex flex-col overflow-hidden rounded-2xl"
              style={stopToGradientStyle(gradients[key])}
            >
              {illustration}
              <CardText title={title} body={body} />
            </div>
          ))}
        </div>
      </div>

      <GradientEditor gradients={gradients} onChange={update} />
    </section>
  );
}
