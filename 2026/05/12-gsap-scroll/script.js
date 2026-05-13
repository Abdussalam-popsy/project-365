gsap.registerPlugin(ScrollTrigger);

// ── Establish initial states explicitly ──────────────────────────────────
gsap.set(".slide-img:nth-child(1)", { opacity: 1 });
gsap.set(".slide-img:nth-child(2), .slide-img:nth-child(3)", {
  opacity: 0,
});
gsap.set(".num-1", { opacity: 1 });
gsap.set(".num-2, .num-3", { opacity: 0 });

// ── Scrubbed timeline ────────────────────────────────────────────────────
//
// Layout of the 5-unit timeline:
//   0.0 – 0.6   panel 1 reveals
//   0.6 – 1.5   panel 1 holds
//   1.5 – 2.4   transition 1 → 2  (out + image crossfade + star tick + in)
//   2.4 – 3.2   panel 2 holds
//   3.2 – 4.1   transition 2 → 3
//   4.1 – 5.0   panel 3 holds
//
// Debug: when start and scroller-start align, GSAP draws several labels in one spot
// (scroller-start / start / id) — that is one ScrollTrigger, not three versions.
const tl = gsap.timeline({
  scrollTrigger: {
    id: "v1-pin",
    trigger: ".pin-section",
    pin: true,
    scrub: 1,
    start: "top top",
    end: "+=300%",
    markers: true,
  },
});

const DUR = 0.42; // single element clip duration
const S = 0.12; // stagger: heading → body → buttons
const EASE = "power2.inOut";

// Debug: step markers inside the pinned scroll (GSAP markers, not custom UI)
// These create extra ScrollTriggers that only exist to visualize the ranges
// where each panel/step is "active" within the scrubbed timeline.
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
// add a blur transition to the star
tl.to(
  ".star-svg",
  {
    rotation: 360,
    filter: "blur(10px)",
    transformOrigin: "50% 50%",
    duration: 5,
    ease: "none",
  },
  0,
);

// ── Panel 1: reveal ──────────────────────────────────────────────────────
tl.fromTo(
  ".panel-1 .panel-heading",
  { clipPath: "inset(0 100% 0 0)" },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  0,
);
tl.fromTo(
  ".panel-1 .panel-body",
  { clipPath: "inset(0 100% 0 0)" },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  S,
);
tl.fromTo(
  ".panel-1 .panel-buttons",
  { clipPath: "inset(0 100% 0 0)" },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  S * 2,
);

// ── Transition 1 → 2 ────────────────────────────────────────────────────
const T1 = 1.5;

// panel 1 exits (curtain closes from right)
tl.to(
  ".panel-1 .panel-heading",
  { clipPath: "inset(0 0% 0 100%)", duration: DUR, ease: EASE },
  T1,
);
tl.to(
  ".panel-1 .panel-body",
  { clipPath: "inset(0 0% 0 100%)", duration: DUR, ease: EASE },
  T1 + S,
);
tl.to(
  ".panel-1 .panel-buttons",
  { clipPath: "inset(0 0% 0 100%)", duration: DUR, ease: EASE },
  T1 + S * 2,
);

// image cross-dissolve
tl.to(
  ".slide-img:nth-child(1)",
  { opacity: 0, duration: 0.55, ease: "power1.inOut" },
  T1 + 0.1,
);
tl.to(
  ".slide-img:nth-child(2)",
  { opacity: 1, duration: 0.55, ease: "power1.inOut" },
  T1 + 0.1,
);

// number swap
tl.to(".num-1", { opacity: 0, duration: 0.2 }, T1 + 0.3);
tl.to(".num-2", { opacity: 1, duration: 0.2 }, T1 + 0.42);

// panel 2 reveals
const T1in = T1 + 0.58;
tl.fromTo(
  ".panel-2 .panel-heading",
  { clipPath: "inset(0 100% 0 0)", immediateRender: false },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  T1in,
);
tl.fromTo(
  ".panel-2 .panel-body",
  { clipPath: "inset(0 100% 0 0)", immediateRender: false },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  T1in + S,
);
tl.fromTo(
  ".panel-2 .panel-buttons",
  { clipPath: "inset(0 100% 0 0)", immediateRender: false },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  T1in + S * 2,
);

// ── Transition 2 → 3 ────────────────────────────────────────────────────
const T2 = 3.2;

// panel 2 exits
tl.to(
  ".panel-2 .panel-heading",
  { clipPath: "inset(0 0% 0 100%)", duration: DUR, ease: EASE },
  T2,
);
tl.to(
  ".panel-2 .panel-body",
  { clipPath: "inset(0 0% 0 100%)", duration: DUR, ease: EASE },
  T2 + S,
);
tl.to(
  ".panel-2 .panel-buttons",
  { clipPath: "inset(0 0% 0 100%)", duration: DUR, ease: EASE },
  T2 + S * 2,
);

// image cross-dissolve
tl.to(
  ".slide-img:nth-child(2)",
  { opacity: 0, duration: 0.55, ease: "power1.inOut" },
  T2 + 0.1,
);
tl.to(
  ".slide-img:nth-child(3)",
  { opacity: 1, duration: 0.55, ease: "power1.inOut" },
  T2 + 0.1,
);

// number swap
tl.to(".num-2", { opacity: 0, duration: 0.2 }, T2 + 0.3);
tl.to(".num-3", { opacity: 1, duration: 0.2 }, T2 + 0.42);

// panel 3 reveals
const T2in = T2 + 0.58;
tl.fromTo(
  ".panel-3 .panel-heading",
  { clipPath: "inset(0 100% 0 0)", immediateRender: false },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  T2in,
);
tl.fromTo(
  ".panel-3 .panel-body",
  { clipPath: "inset(0 100% 0 0)", immediateRender: false },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  T2in + S,
);
tl.fromTo(
  ".panel-3 .panel-buttons",
  { clipPath: "inset(0 100% 0 0)", immediateRender: false },
  { clipPath: "inset(0 0% 0 0)", duration: DUR, ease: EASE },
  T2in + S * 2,
);

// Step markers you requested:
// - Step 1: "Connect Beyond Likes" + image 1 (animate-in → animate-out)
// - Step 2: panel 2 range
// - Step 3: panel 3 range
//
// We use the existing timeline "in" timestamps as boundaries:
// Step 1: 0 → T1in
// Step 2: T1in → T2in
// Step 3: T2in → end
addStepMarker({ id: "step-1", timeStart: 0, timeEnd: T1in, indent: 0 });
addStepMarker({ id: "step-2", timeStart: T1in, timeEnd: T2in, indent: 20 });
addStepMarker({
  id: "step-3",
  timeStart: T2in,
  timeEnd: tl.duration(),
  indent: 40,
});
