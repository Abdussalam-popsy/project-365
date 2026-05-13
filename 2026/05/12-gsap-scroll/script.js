gsap.registerPlugin(ScrollTrigger);

// ── Debug flag — controlled by the nav toggle (debug.js + localStorage) ──────
const DEBUG = window.DEBUG || false;
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Split heading/body into spans for stagger (no SplitText plugin).
 * Headings → characters; body → words (long copy reads better by word).
 */
function splitPanelText() {
  document.querySelectorAll(".panel .panel-heading").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", text.trim());
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "split-char";
      span.textContent = ch === " " ? "\u00a0" : ch;
      el.appendChild(span);
    }
  });

  document.querySelectorAll(".panel .panel-body").forEach((el) => {
    const text = el.textContent.trim();
    const words = text.split(/\s+/).filter(Boolean);
    el.textContent = "";
    el.setAttribute("aria-label", text);
    words.forEach((word, i) => {
      const span = document.createElement("span");
      span.className = "split-word";
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });
  });
}

splitPanelText();

// ── Establish initial states explicitly ──────────────────────────────────
gsap.set(".slide-img:nth-child(1)", { clipPath: "inset(0%)" });
gsap.set(".slide-img:nth-child(2), .slide-img:nth-child(3)", {
  clipPath: "inset(50%)",
});
gsap.set(".num-1", { opacity: 1 });
gsap.set(".num-2, .num-3", { opacity: 0 });

gsap.set(
  ".panel-1 .panel-heading .split-char, .panel-1 .panel-body .split-word",
  { y: -36, opacity: 0 },
);

// Panels 2 & 3 copy hidden until their reveal
gsap.set(
  [
    ".panel-2 .panel-heading .split-char",
    ".panel-2 .panel-body .split-word",
    ".panel-2 .panel-buttons",
    ".panel-3 .panel-heading .split-char",
    ".panel-3 .panel-body .split-word",
    ".panel-3 .panel-buttons",
  ],
  { y: -36, opacity: 0 },
);

// ── Scrubbed timeline ────────────────────────────────────────────────────
//
// Layout of the 5-unit timeline (copy = staggered translate + opacity):
//   0.0 – 0.6   panel 1 reveals
//   0.6 – 1.5   panel 1 holds
//   1.5 – 2.4   transition 1 → 2  (lift out + image crossfade + number + in)
//   2.4 – 3.2   panel 2 holds
//   3.2 – 4.1   transition 2 → 3
//   4.1 – 5.0   panel 3 holds
//
const tl = gsap.timeline({
  scrollTrigger: {
    id: "v1-pin",
    trigger: ".pin-section",
    pin: true,
    scrub: 1,
    start: "top top",
    end: "+=300%",
    markers: DEBUG,
  },
});

const S = 0.12; // offset: heading block → body block → buttons
const EASE = "power2.out";
const ENTER = { y: -36, opacity: 0 };
const REST = { y: 0, opacity: 1 };
const LEAVE = { y: -28, opacity: 0 };

/** Stagger: heading by character, body by word */
const HEAD_STAG = 0.028;
const HEAD_UNIT = 0.1;
const BODY_STAG = 0.034;
const BODY_UNIT = 0.12;
const OUT_HEAD_STAG = 0.022;
const OUT_BODY_STAG = 0.028;

// Debug: step markers inside the pinned scroll
function addStepMarker({ id, timeStart, timeEnd, indent = 0 }) {
  const st = tl.scrollTrigger;
  if (!st) return;

  const toScroll = (t) => {
    const dur = tl.duration() || 1;
    const p = Math.min(1, Math.max(0, t / dur));
    return st.start + (st.end - st.start) * p;
  };

  ScrollTrigger.create({
    id,
    trigger: st.trigger,
    start: () => toScroll(timeStart),
    end: () => toScroll(timeEnd),
    markers: { indent },
  });
}

// ── Star: continuous clockwise rotation across the full scroll ───────────
tl.to(
  ".star-svg",
  {
    rotation: 360,
    transformOrigin: "50% 50%",
    duration: 5,
    ease: "none",
  },
  0,
);

// ── Panel 1: staggered reveal (chars → words → buttons block) ────────────
tl.fromTo(
  ".panel-1 .panel-heading .split-char",
  ENTER,
  {
    ...REST,
    duration: HEAD_UNIT,
    stagger: { each: HEAD_STAG, from: "start" },
    ease: EASE,
  },
  0,
);
tl.fromTo(
  ".panel-1 .panel-body .split-word",
  ENTER,
  {
    ...REST,
    duration: BODY_UNIT,
    stagger: { each: BODY_STAG, from: "start" },
    ease: EASE,
  },
  S,
);
tl.fromTo(
  ".panel-1 .panel-buttons",
  ENTER,
  { ...REST, duration: 0.38, ease: EASE },
  S * 2,
);

// ── Transition 1 → 2 ────────────────────────────────────────────────────
const T1 = 1.5;

tl.to(
  ".panel-1 .panel-heading .split-char",
  {
    ...LEAVE,
    duration: HEAD_UNIT * 0.85,
    stagger: { each: OUT_HEAD_STAG, from: "end" },
    ease: EASE,
  },
  T1,
);
tl.to(
  ".panel-1 .panel-body .split-word",
  {
    ...LEAVE,
    duration: BODY_UNIT * 0.85,
    stagger: { each: OUT_BODY_STAG, from: "end" },
    ease: EASE,
  },
  T1 + S,
);
tl.to(
  ".panel-1 .panel-buttons",
  { ...LEAVE, duration: 0.36, ease: EASE },
  T1 + S * 2,
);

// image iris transition 1 → 2
tl.to(
  ".slide-img:nth-child(1)",
  { clipPath: "inset(50%)", duration: 0.55, ease: "power2.inOut" },
  T1 + 0.1,
);
tl.fromTo(
  ".slide-img:nth-child(2)",
  { clipPath: "inset(50%)", immediateRender: false },
  { clipPath: "inset(0%)", duration: 0.55, ease: "power2.inOut" },
  T1 + 0.1,
);

// number swap
tl.to(".num-1", { opacity: 0, duration: 0.2 }, T1 + 0.3);
tl.to(".num-2", { opacity: 1, duration: 0.2 }, T1 + 0.42);

// panel 2 reveals
const T1in = T1 + 0.58;
tl.fromTo(
  ".panel-2 .panel-heading .split-char",
  { ...ENTER, immediateRender: false },
  {
    ...REST,
    duration: HEAD_UNIT,
    stagger: { each: HEAD_STAG, from: "start" },
    ease: EASE,
  },
  T1in,
);
tl.fromTo(
  ".panel-2 .panel-body .split-word",
  { ...ENTER, immediateRender: false },
  {
    ...REST,
    duration: BODY_UNIT,
    stagger: { each: BODY_STAG, from: "start" },
    ease: EASE,
  },
  T1in + S,
);
tl.fromTo(
  ".panel-2 .panel-buttons",
  { ...ENTER, immediateRender: false },
  { ...REST, duration: 0.38, ease: EASE },
  T1in + S * 2,
);

// ── Transition 2 → 3 ────────────────────────────────────────────────────
const T2 = 3.2;

tl.to(
  ".panel-2 .panel-heading .split-char",
  {
    ...LEAVE,
    duration: HEAD_UNIT * 0.85,
    stagger: { each: OUT_HEAD_STAG, from: "end" },
    ease: EASE,
  },
  T2,
);
tl.to(
  ".panel-2 .panel-body .split-word",
  {
    ...LEAVE,
    duration: BODY_UNIT * 0.85,
    stagger: { each: OUT_BODY_STAG, from: "end" },
    ease: EASE,
  },
  T2 + S,
);
tl.to(
  ".panel-2 .panel-buttons",
  { ...LEAVE, duration: 0.36, ease: EASE },
  T2 + S * 2,
);

// image iris transition 2 → 3
tl.to(
  ".slide-img:nth-child(2)",
  { clipPath: "inset(50%)", duration: 0.55, ease: "power2.inOut" },
  T2 + 0.1,
);
tl.fromTo(
  ".slide-img:nth-child(3)",
  { clipPath: "inset(50%)", immediateRender: false },
  { clipPath: "inset(0%)", duration: 0.55, ease: "power2.inOut" },
  T2 + 0.1,
);

// number swap
tl.to(".num-2", { opacity: 0, duration: 0.2 }, T2 + 0.3);
tl.to(".num-3", { opacity: 1, duration: 0.2 }, T2 + 0.42);

// panel 3 reveals
const T2in = T2 + 0.58;
tl.fromTo(
  ".panel-3 .panel-heading .split-char",
  { ...ENTER, immediateRender: false },
  {
    ...REST,
    duration: HEAD_UNIT,
    stagger: { each: HEAD_STAG, from: "start" },
    ease: EASE,
  },
  T2in,
);
tl.fromTo(
  ".panel-3 .panel-body .split-word",
  { ...ENTER, immediateRender: false },
  {
    ...REST,
    duration: BODY_UNIT,
    stagger: { each: BODY_STAG, from: "start" },
    ease: EASE,
  },
  T2in + S,
);
tl.fromTo(
  ".panel-3 .panel-buttons",
  { ...ENTER, immediateRender: false },
  { ...REST, duration: 0.38, ease: EASE },
  T2in + S * 2,
);

if (DEBUG) {
  addStepMarker({ id: "step-1", timeStart: 0, timeEnd: T1in, indent: 0 });
  addStepMarker({ id: "step-2", timeStart: T1in, timeEnd: T2in, indent: 100 });
  addStepMarker({ id: "step-3", timeStart: T2in, timeEnd: tl.duration(), indent: 180 });
}
