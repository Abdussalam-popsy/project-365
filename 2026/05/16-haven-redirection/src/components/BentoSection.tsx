import { useEffect, useState } from "react";
import { GradientEditor } from "@/micro-tools/gradient/GradientEditor";
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
  { label: "W", name: "WhatsApp" },
  { label: "M", name: "Gmail" },
  { label: "✦", name: "Slack" },
  { label: "✆", name: "Phone" },
  { label: "↗", name: "Telegram" },
  { label: "✉", name: "iMessage" },
];

function ReceiveIllustration() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % CHANNELS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex h-[236px] items-center justify-center">
      <div className="animate-float grid grid-cols-3 gap-2.5">
        {CHANNELS.map((ch, i) => (
          <div
            key={ch.name}
            title={ch.name}
            className={`relative flex h-16 w-16 select-none items-center justify-center rounded-lg border text-base text-white backdrop-blur-sm transition-all duration-700 ${
              i === active
                ? "border-white/30 bg-white/25 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                : "border-white/[0.1] bg-white/[0.08]"
            }`}
          >
            {ch.label}
            {/* Activity ping on active channel */}
            {i === active && (
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white/80" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card 2: Act on your SOPs ─────────────────────────────────────────────────
const STEPS = [
  { label: "Adding to PMS",       icon: "⟳" },
  { label: "Syncing to PMS",      icon: "↻" },
  { label: "Confirmed & secured", icon: "✓" },
];

function SopsIllustration() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % STEPS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex h-[236px] items-start pl-12 pt-7">
      <div className="flex flex-col gap-3.5">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-start gap-4">
            {/* Timeline track */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-700 ${
                  i === active
                    ? "border-white/30 bg-white/25 text-white shadow-[0_0_14px_rgba(255,255,255,0.2)]"
                    : i < active
                    ? "border-white/20 bg-white/15 text-white/80"
                    : "border-white/[0.1] bg-white/[0.08] text-white/40"
                }`}
              >
                <span className="text-sm">{step.icon}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mt-1 h-5 w-px transition-all duration-700 ${
                    i < active ? "bg-white/30" : "bg-white/10"
                  }`}
                />
              )}
            </div>
            {/* Step text */}
            <div className="-mt-0.5 flex flex-col">
              <p
                className={`text-sm font-medium leading-none tracking-[-0.04em] transition-colors duration-700 ${
                  i === active ? "text-white" : "text-white/50"
                }`}
              >
                {step.label}
              </p>
              <p className="mt-1 text-[11px] leading-tight tracking-[-0.03em] text-white/30">
                Andrew P. successfully called for an enquiry
              </p>
              <p className="mt-0.5 text-[11px] tracking-[-0.03em] text-white/30">
                12.10.2026 · 18:14 · Monday
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card 3: Sync back to PMS ────────────────────────────────────────────────
// S-curve wave paths — two mirrored bezier curves spanning the card width.
// `preserveAspectRatio="none"` lets them stretch to fill any card width.
const UPPER_WAVE = "M 0 75 C 70 35 150 115 220 75 C 290 35 370 115 440 75";
const LOWER_WAVE = "M 0 161 C 70 201 150 121 220 161 C 290 201 370 121 440 161";

function SyncIllustration() {
  return (
    <div className="relative h-[236px] overflow-hidden">
      {/* Wave SVG — fills the full illustration area */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 440 236"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Center horizontal line */}
        <line x1="0" y1="118" x2="440" y2="118" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

        {/* Static wave traces */}
        <path d={UPPER_WAVE} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" />
        <path d={LOWER_WAVE} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" />

        {/* Animated data-flow dots: `dash-flow` keyframe is in index.css */}
        <path
          d={UPPER_WAVE}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="3 20"
          style={{ animation: "dash-flow 3s linear infinite" }}
        />
        <path
          d={LOWER_WAVE}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="3 20"
          style={{ animation: "dash-flow 3s linear infinite", animationDelay: "1.5s" }}
        />
      </svg>

      {/* Scatter dots (glass) */}
      <div className="absolute left-[7%]  top-[34%] h-3 w-3 rounded-full border border-white/10 bg-white/15 backdrop-blur-sm" />
      <div className="absolute left-[20%] top-[54%] h-3 w-3 rounded-full border border-white/10 bg-white/10 backdrop-blur-sm" />
      <div className="absolute left-[33%] top-[43%] h-3 w-3 rounded-full border border-white/10 bg-white/15 backdrop-blur-sm" />
      <div className="absolute left-[14%] top-[65%] h-[10px] w-[10px] rounded-full bg-white/10" />

      {/* Central sync icon */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/20 bg-white/[0.08] backdrop-blur-md">
          {/* Sync / refresh icon — SVG so it scales crisp */}
          <svg
            className="animate-spin-slow h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      {/* PMS record stubs — glass cards with simulated row content */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex h-[54px] w-[42px] flex-col justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-2 py-2 backdrop-blur-sm"
          >
            <div className="h-px w-full rounded-full bg-white/30" />
            <div className="h-px w-3/4 rounded-full bg-white/20" />
            <div className="h-px w-full rounded-full bg-white/20" />
            <div className="h-px w-1/2 rounded-full bg-white/15" />
            <div className="h-px w-2/3 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Main section ─────────────────────────────────────────────────────────────
const CARDS: { key: GradientKey; illustration: React.ReactNode; title: string; body: string }[] = [
  {
    key: "receive",
    illustration: <ReceiveIllustration />,
    title: "Receive every request",
    body: "Haven picks up every inbound interaction 24/7 across every channel your residents and owners already use.",
  },
  {
    key: "sops",
    illustration: <SopsIllustration />,
    title: "Act on your SOPs",
    body: "It follows your rules, your escalation paths, and your SLAs and loops in your team only when it has to.",
  },
  {
    key: "pms",
    illustration: <SyncIllustration />,
    title: "Sync back to your PMS",
    body: "Every action, note, and update goes straight into your property management software.",
  },
];

export function BentoSection() {
  const [gradients, setGradients] = useState<GradientMap>(DEFAULT_GRADIENTS);
  const update = (key: GradientKey, stop: Stop) =>
    setGradients((prev) => ({ ...prev, [key]: stop }));

  return (
    <section className="w-full bg-cream px-5 py-[72px] sm:px-10 lg:px-20">
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="w-[361px] text-[40px] font-semibold leading-[1.1] tracking-[-0.05em] text-neutral-900">
            Everything you need
          </h2>
          <button className="rounded-[8px] bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700">
            Book a demo
          </button>
        </div>

        {/* Bento grid — cards flex to fill the full 1280px container */}
        <div className="grid w-full grid-cols-3 gap-6">
          {CARDS.map(({ key, illustration, title, body }) => (
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
