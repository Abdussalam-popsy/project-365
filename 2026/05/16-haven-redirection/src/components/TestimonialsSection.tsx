import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { VignetteEditor } from "@/micro-tools/testimonials/VignetteEditor";

// ─── Tune these once you've found your preferred values ───────────────────────
const DEFAULT_INACTIVE_OPACITY = 0.15;

// ─── Data ─────────────────────────────────────────────────────────────────────
const BASE = import.meta.env.BASE_URL;
const TESTIMONIALS = [
  {
    logo: `${BASE}assets/logos/greystar.svg`,
    quote:
      "Haven answered every after-hours call we were missing. Resident satisfaction scores went up 40% in our first quarter.",
    name: "Sarah Mitchell",
    role: "VP of Operations, Greystar",
    initials: "SM",
    avatarColor: "#1E4D7B",
  },
  {
    logo: `${BASE}assets/logos/cbre.svg`,
    quote:
      "We went from three coordinators managing maintenance chaos to one — because Haven handles everything else automatically.",
    name: "James Okafor",
    role: "Director of Property Management, CBRE",
    initials: "JO",
    avatarColor: "#C05A2A",
  },
  {
    logo: `${BASE}assets/logos/jll.svg`,
    quote:
      "Our leasing velocity improved dramatically. Haven responds to new leads in minutes, schedules tours, and keeps the PMS current.",
    name: "Elena Vasquez",
    role: "Head of Residential Leasing, JLL",
    initials: "EV",
    avatarColor: "#2D6B4A",
  },
  {
    logo: `${BASE}assets/logos/colliers.svg`,
    quote:
      "I was skeptical about AI handling tenant calls. Now I can't imagine managing our portfolio without it. The best hire we never made.",
    name: "David Park",
    role: "Regional Property Manager, Colliers",
    initials: "DP",
    avatarColor: "#7B4E1E",
  },
  {
    logo: `${BASE}assets/logos/avalonbay.svg`,
    quote:
      "Maintenance coordination alone saved us 20 hours per week per property. Vendors contacted, appointments scheduled, residents updated — automatically.",
    name: "Rachel Thompson",
    role: "Chief Operating Officer, AvalonBay",
    initials: "RT",
    avatarColor: "#4A2D6B",
  },
];

const ACTIVE_BG = "#e8d5b3";
const INACTIVE_BG = "#f6eddb";
const AUTOPLAY_DELAY = 5_000;

// ─── Section ──────────────────────────────────────────────────────────────────
export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [
      Autoplay({
        delay: AUTOPLAY_DELAY,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inactiveOpacity, setInactiveOpacity] = useState(
    DEFAULT_INACTIVE_OPACITY,
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="w-full bg-cream py-[72px]">
      {/* ── Heading ── */}
      <div className="mx-auto mb-10 w-full max-w-[1280px] px-5 sm:px-10 lg:mb-12 lg:px-20">
        <h2 className="text-center text-[32px] font-semibold leading-[1.1] tracking-[-0.05em] text-neutral-900 lg:text-[40px]">
          What property managers
          <br className="hidden sm:block" /> like you are saying
        </h2>
      </div>

      {/* ── Carousel ── */}
      <div className="relative">
        {/* Fade edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-32"
          style={{
            background:
              "linear-gradient(to right, #ebe5d8 0%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-32"
          style={{
            background:
              "linear-gradient(to left, #ebe5d8 0%, transparent 100%)",
          }}
        />

        {/*
          overflow-x: clip  → hides off-screen slides (Embla needs horizontal clipping)
          overflow-y: visible → ink overflow (box-shadow) is NOT clipped vertically.
          Unlike overflow: hidden which clips both axes, this lets the active card's
          shadow breathe downward without any padding tricks.
        */}
        <div ref={emblaRef} style={{ overflowX: "clip", overflowY: "visible" }}>
          {/*
            -ml-5/-ml-6: offsets the first slide's left padding.
            padding-left on each slide (not gap on container) fixes the loop-seam
            gap inconsistency between slide 5 → slide 1.
            py-8: visual breathing room so the shadow has clear space above/below.
          */}
          <div className="-ml-5 flex py-8 lg:-ml-6">
            {TESTIMONIALS.map((t, i) => {
              const isActive = i === selectedIndex;
              return (
                <div
                  key={i}
                  className="shrink-0 pl-5 lg:pl-6"
                  style={{ width: "min(640px, 82%)" }}
                >
                  <div
                    className="flex min-h-[280px] flex-col justify-between rounded-[8px] px-4 py-6 transition-all duration-500 lg:min-h-[351px] lg:px-6"
                    style={{
                      background: isActive ? ACTIVE_BG : INACTIVE_BG,
                      opacity: isActive ? 1 : inactiveOpacity,
                      boxShadow: isActive
                        ? "0 24px 64px -12px rgba(83,56,9,0.22), 0 8px 20px -6px rgba(83,56,9,0.12)"
                        : "none",
                    }}
                  >
                    {/* Top: logo + quote */}
                    <div className="flex flex-col gap-5 lg:gap-6">
                      <img
                        src={t.logo}
                        alt=""
                        className="h-8 w-auto max-w-[150px] object-contain object-left opacity-75"
                      />
                      <p className="text-[20px] font-semibold leading-[1.1] tracking-[-0.04em] text-black lg:text-[28px]">
                        "{t.quote}"
                      </p>
                    </div>

                    {/* Bottom: author */}
                    <div className="mt-8 flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold leading-none text-white"
                        style={{ background: t.avatarColor }}
                      >
                        {t.initials}
                      </div>
                      <div className="flex flex-col gap-[5px]">
                        <p className="text-[18px] font-semibold leading-none tracking-[-0.03em] text-black">
                          {t.name}
                        </p>
                        <p className="text-[12px] leading-[1.3] tracking-[-0.03em] text-black/60">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="mx-auto mt-8 flex w-full max-w-[1280px] items-center justify-center gap-6 px-5 sm:px-10 lg:px-20">
        <button
          onClick={scrollPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-lg text-black/50 transition-colors hover:border-black/30 hover:text-black"
          aria-label="Previous testimonial"
        >
          ←
        </button>
        <p className="font-sans text-base leading-[1.3] tracking-[-0.04em] text-black">
          {selectedIndex + 1} / {TESTIMONIALS.length}
        </p>
        <button
          onClick={scrollNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-lg text-black/50 transition-colors hover:border-black/30 hover:text-black"
          aria-label="Next testimonial"
        >
          →
        </button>
      </div>

      {import.meta.env.DEV && (
        <VignetteEditor
          inactiveOpacity={inactiveOpacity}
          onOpacityChange={setInactiveOpacity}
        />
      )}
    </section>
  );
}
