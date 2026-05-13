gsap.registerPlugin(ScrollTrigger, SplitText);
// if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// ── Highlight text on scroll ──────────────────────────────────────────────────
function initHighlightText() {
  const targets = document.querySelectorAll("[data-highlight-text]");
  targets.forEach((heading) => {
    const scrollStart =
      heading.getAttribute("data-highlight-scroll-start") || "top 85%";
    const scrollEnd =
      heading.getAttribute("data-highlight-scroll-end") || "bottom 20%";
    const fadedValue =
      parseFloat(heading.getAttribute("data-highlight-fade")) || 0.18;
    const staggerValue =
      parseFloat(heading.getAttribute("data-highlight-stagger")) || 0.1;

    new SplitText(heading, {
      type: "words, chars",
      autoSplit: true,
      onSplit(self) {
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              scrub: true,
              trigger: heading,
              start: scrollStart,
              end: scrollEnd,
            },
          });
          tl.from(self.chars, {
            autoAlpha: fadedValue,
            stagger: staggerValue,
            ease: "linear",
          });
        });
        return ctx;
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHighlightText();
});
// ─────────────────────────────────────────────────────────────────────────────

// ── Tuning knob ──────────────────────────────────────────────────────────────
// Where the fanned cards' shared centre lands, as a fraction of viewport height.
// Increase to push the fan further down (more gap below title).
const FAN_CENTER_VH = 0.65;
// ────────────────────────────────────────────────────────────────────────────

/**
 * Returns each card's starting centre Y in viewport coordinates for the moment
 * the pin section is at the top of the viewport. Works by computing the card's
 * position relative to the pin section — so it's accurate regardless of where
 * the page is currently scrolled.
 */
function getStartCenterY(cardSelector) {
  const pin = document.querySelector(".v2-pin");
  const card = document.querySelector(cardSelector);
  const pinTop = pin.getBoundingClientRect().top;
  const cardRect = card.getBoundingClientRect();
  return cardRect.top - pinTop + cardRect.height / 2;
}

/**
 * Computes the GSAP x / y / rotation / zIndex needed to move each card from
 * its CSS off-screen position into the final fanned layout.
 */
function buildDeal(isNarrow) {
  const fanX = isNarrow ? 96 : 180;
  const fanY = window.innerHeight * FAN_CENTER_VH;

  return {
    card1: {
      x: -fanX,
      y: fanY - getStartCenterY(".v2-card-1"),
      rotation: -8.22,
      zIndex: 1,
    },
    card2: {
      x: 0,
      y: fanY - getStartCenterY(".v2-card-2"),
      rotation: 0,
      zIndex: 2,
    },
    card3: {
      x: fanX,
      y: fanY - getStartCenterY(".v2-card-3"),
      rotation: 12.22,
      zIndex: 3,
    },
  };
}

function setReducedMotionFan(isNarrow) {
  const deal = buildDeal(isNarrow);
  gsap.set(".v2-card-1", deal.card1);
  gsap.set(".v2-card-2", deal.card2);
  gsap.set(".v2-card-3", deal.card3);
}

function createDealingTimeline(isNarrow) {
  const deal = buildDeal(isNarrow);

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
      end: "+=260%",
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
  const STEP_2 = 1.4;
  const STEP_3 = 2.8;
  const HOLD_END = 3.8;

  tl.to(
    ".v2-card-1",
    { ...deal.card1, duration: DEAL_DURATION, ease: EASE },
    STEP_1,
  );
  tl.to(
    ".v2-card-2",
    { ...deal.card2, duration: DEAL_DURATION, ease: EASE },
    STEP_2,
  );
  tl.to(
    ".v2-card-3",
    { ...deal.card3, duration: DEAL_DURATION, ease: EASE },
    STEP_3,
  );
  tl.to({}, { duration: HOLD_END - STEP_3 - DEAL_DURATION });

  // Uncomment to debug step phases:
  // addStepMarker({ id: "v2-card-1", timeStart: STEP_1, timeEnd: STEP_2, indent: 0 });
  // addStepMarker({ id: "v2-card-2", timeStart: STEP_2, timeEnd: STEP_3, indent: 100 });
  // addStepMarker({ id: "v2-card-3", timeStart: STEP_3, timeEnd: tl.duration(), indent: 180 });
}

const narrowQuery = "(max-width: 760px)";

if (reduceMotion) {
  setReducedMotionFan(window.matchMedia(narrowQuery).matches);
} else {
  const mm = gsap.matchMedia();

  mm.add(narrowQuery, () => createDealingTimeline(true));
  mm.add("(min-width: 761px)", () => createDealingTimeline(false));

  if (document.fonts) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}
