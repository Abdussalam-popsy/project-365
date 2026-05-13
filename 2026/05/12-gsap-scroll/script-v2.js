gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEAL = {
  card1: { x: -180, y: 110, rotation: -12, zIndex: 1 },
  card2: { x: 0, y: -370, rotation: 2, zIndex: 2 },
  card3: { x: 180, y: -810, rotation: 10, zIndex: 3 },
};

if (reduceMotion) {
  gsap.set(".v2-card-1", { x: -180, y: -10, rotation: -12, zIndex: 1 });
  gsap.set(".v2-card-2", { x: 0, y: -30, rotation: 2, zIndex: 2 });
  gsap.set(".v2-card-3", { x: 180, y: -10, rotation: 10, zIndex: 3 });
} else {
  gsap.set(".v2-card-1", { zIndex: 1 });
  gsap.set(".v2-card-2", { zIndex: 2 });
  gsap.set(".v2-card-3", { zIndex: 3 });

  const tl = gsap.timeline({
    scrollTrigger: {
      id: "v2-pin",
      trigger: ".v2-pin",
      pin: true,
      scrub: 1,
      start: "top top",
      end: "+=240%",
      // markers: true,
    },
  });

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

  const EASE = "power2.out";
  const DEAL_DURATION = 0.6;
  const STEP_1 = 0;
  const STEP_2 = 1.2;
  const STEP_3 = 2.4;
  const HOLD_END = 3.4;

  tl.to(
    ".v2-card-1",
    { ...DEAL.card1, duration: DEAL_DURATION, ease: EASE },
    STEP_1,
  );

  tl.to(
    ".v2-card-2",
    { ...DEAL.card2, duration: DEAL_DURATION, ease: EASE },
    STEP_2,
  );

  tl.to(
    ".v2-card-3",
    { ...DEAL.card3, duration: DEAL_DURATION, ease: EASE },
    STEP_3,
  );

  tl.to({}, { duration: HOLD_END - STEP_3 - DEAL_DURATION });

  // Uncomment while tuning the scrub phases.
  // addStepMarker({ id: "v2-card-1", timeStart: STEP_1, timeEnd: STEP_2, indent: 0 });
  // addStepMarker({ id: "v2-card-2", timeStart: STEP_2, timeEnd: STEP_3, indent: 100 });
  // addStepMarker({
  //   id: "v2-card-3",
  //   timeStart: STEP_3,
  //   timeEnd: tl.duration(),
  //   indent: 180,
  // });
}
