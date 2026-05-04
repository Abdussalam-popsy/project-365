import { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useDialKit, DialRoot } from "dialkit";
import "dialkit/styles.css";

// ─── Shared pixel size ────────────────────────────────────────────────────────
const PX = 7;
const PG = 1;

// ─── Pixel house bitmap (19 cols × 17 rows) ───────────────────────────────────
const HOUSE_MAP: number[][] = [
  [0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const IDLE_COLOR = "#D2C8B4";

const HOUSE_CONFIGS = [
  { hoverColor: "#D86E40" },
  { hoverColor: "#75927F" },
  { hoverColor: "#C1CFCA" },
  { hoverColor: "#E8D5B3" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type HouseAnimParams = { transitionDuration: number; transitionEasing: string };
type GridAnimParams  = {
  flickerMinDuration: number;
  flickerMaxDuration: number;
  flickerMaxDelay:    number;
  fadeOutDuration:    number;
  fadeOutEasing:      string;
};

// ─── PixelHouse ───────────────────────────────────────────────────────────────
// No React state — color is updated via CSS custom property directly on the DOM.
function PixelHouse({
  idleColor,
  hoverColor,
  onHoverChange,
  anim,
}: {
  idleColor: string;
  hoverColor: string;
  onHoverChange: (h: boolean) => void;
  anim: HouseAnimParams;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleEnter() {
    wrapperRef.current?.style.setProperty("--cell-color", hoverColor);
    onHoverChange(true);
  }
  function handleLeave() {
    wrapperRef.current?.style.setProperty("--cell-color", idleColor);
    onHoverChange(false);
  }

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ "--cell-color": idleColor, cursor: "pointer", display: "inline-block" } as React.CSSProperties}
    >
      {HOUSE_MAP.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: PG, marginBottom: PG }}>
          {row.map((cell, ci) => (
            <div
              key={ci}
              style={{
                width: PX,
                height: PX,
                borderRadius: 2,
                backgroundColor: cell ? "var(--cell-color)" : "transparent",
                transition: `background-color ${anim.transitionDuration}s ${anim.transitionEasing}`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── PixelBase ────────────────────────────────────────────────────────────────
// Hover state is managed imperatively — no React re-renders on hover.
// data-state on the grid container drives animation via CSS classes in index.css.
const BASE_COLS = 200;
const BASE_ROWS = 44;
const BASE_SHADES = ["#DDD5C2", "#D4CBBA", "#E4DECE", "#CAC0AE"];

export type PixelBaseHandle = { setHovered: (h: boolean) => void };

const PixelBase = forwardRef<PixelBaseHandle, { anim: GridAnimParams }>(
  function PixelBase({ anim }, ref) {
    const gridRef = useRef<HTMLDivElement>(null);
    const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Always-current anim values — read imperatively so setHovered never goes stale
    const animRef = useRef(anim);
    useEffect(() => { animRef.current = anim; });

    // Stable random seed per cell — only re-runs when component mounts
    const normParams = useMemo(() =>
      Array.from({ length: BASE_ROWS * BASE_COLS }, () => ({
        color: BASE_SHADES[Math.floor(Math.random() * BASE_SHADES.length)],
        normDuration: Math.random(),
        normDelay:    Math.random(),
      })),
    []);

    // Cell JSX — recomputes only when flicker range/delay sliders change
    const cells = useMemo(() =>
      normParams.map(({ color, normDuration, normDelay }, i) => {
        const duration =
          anim.flickerMinDuration +
          normDuration * (anim.flickerMaxDuration - anim.flickerMinDuration);
        const delay = normDelay * anim.flickerMaxDelay;
        return (
          <div
            key={i}
            className="v5-pixel-cell"
            style={{
              "--dur":   `${duration}s`,
              "--delay": `${delay}s`,
              width:       PX,
              height:      PX,
              borderRadius: 2,
              backgroundColor: color,
            } as React.CSSProperties}
          />
        );
      }),
    [normParams, anim.flickerMinDuration, anim.flickerMaxDuration, anim.flickerMaxDelay]);

    useImperativeHandle(ref, () => ({
      setHovered(h: boolean) {
        const el = gridRef.current;
        if (!el) return;
        // Push current fade params onto the element so CSS can read them
        el.style.setProperty("--fade-dur",  `${animRef.current.fadeOutDuration}s`);
        el.style.setProperty("--fade-ease", animRef.current.fadeOutEasing);
        if (h) {
          if (fadeTimerRef.current) {
            clearTimeout(fadeTimerRef.current);
            fadeTimerRef.current = null;
          }
          el.dataset.state = "active";
        } else {
          el.dataset.state = "fading";
          fadeTimerRef.current = setTimeout(() => {
            el.dataset.state = "idle";
            fadeTimerRef.current = null;
          }, animRef.current.fadeOutDuration * 1000);
        }
      },
    }), []);

    return (
      <div
        ref={gridRef}
        className="v5-pixel-grid"
        data-state="idle"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BASE_COLS}, ${PX}px)`,
          gap: PG,
          overflow: "hidden",
        }}
      >
        {cells}
      </div>
    );
  },
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 80px",
        height: 65,
      }}
    >
      <svg width="88" height="25" viewBox="0 0 88 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_248_16728)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 0H3.50764V10.07L9.04555 7.01305L14.5835 10.07V0H18.0911V23.9433H14.5835V13.8462L9.04555 10.7893L3.50764 13.8462V23.9433H0V0ZM69.8532 16.6162L69.9102 15.659L69.9096 15.6383C69.7804 11.055 66.3678 7.50907 61.9811 7.50907C57.533 7.50907 54.0213 11.2188 54.0213 15.8125C54.0213 20.4062 57.5023 24.1159 62.0115 24.1159C64.7892 24.1159 67.232 22.6703 68.6242 20.3135L65.9909 18.5385C65.1121 19.9658 63.6301 20.8349 61.9811 20.8349C59.6233 20.8349 57.6402 19.0372 57.2924 16.6162H69.8532ZM61.9811 10.7901C63.8783 10.7901 65.4532 11.9293 66.1827 13.5926H57.7237C58.4777 11.9094 60.078 10.7901 61.9811 10.7901ZM77.5407 8.4466C76.9187 8.79247 76.3925 9.2414 75.9464 9.77346V7.98105H72.4386V23.9433H75.9464V15.9622C75.9464 12.1884 78.6884 11.153 80.06 11.107C80.9115 11.107 81.664 11.3165 82.3237 11.7388C82.9616 12.1379 83.472 12.7032 83.8543 13.4348C84.2148 14.1664 84.3962 15.0078 84.3962 15.9622V23.9433H88V15.9954C88 14.4225 87.6808 13.0125 87.0429 11.7721C86.3832 10.5084 85.5032 9.5108 84.3962 8.77918C83.2711 8.02427 82.0148 7.64854 80.6335 7.64854C79.4634 7.64854 78.4335 7.91454 77.5407 8.4466ZM32.3925 9.77352C31.9461 9.2414 31.4199 8.79247 30.7981 8.44667C29.9053 7.91454 28.8753 7.64854 27.7051 7.64854C26.3243 7.64854 25.0679 8.02433 23.9423 8.77918C22.8358 9.5108 21.9557 10.5084 21.2956 11.7721C20.6579 13.0125 20.339 14.4225 20.339 15.9954C20.339 17.5684 20.6579 18.9551 21.2956 20.2188C21.9557 21.4592 22.8358 22.4469 23.9423 23.1784C25.0679 23.91 26.3243 24.2759 27.7051 24.2759C28.8753 24.2759 29.9148 24.0198 30.83 23.511C31.4423 23.1552 31.962 22.7129 32.3925 22.1875V23.9433H35.9002V7.98105H32.3925V9.77352ZM31.404 19.4539C30.6164 20.3618 29.5769 20.8173 28.279 20.8173C27.4276 20.8173 26.675 20.6179 26.015 20.2188C25.3773 19.7964 24.867 19.2211 24.4844 18.4895C24.1241 17.7579 23.9423 16.9166 23.9423 15.9622C23.9423 15.0078 24.1241 14.1664 24.4844 13.4348C24.867 12.7033 25.3773 12.1379 26.015 11.7388C26.675 11.3165 27.4276 11.107 28.279 11.107C29.1304 11.107 29.9053 11.3165 30.543 11.7388C31.2031 12.1379 31.7133 12.7033 32.0736 13.4348C32.434 14.1664 32.6157 15.0078 32.6157 15.9622C32.6157 17.3822 32.2108 18.5461 31.404 19.4539ZM41.8663 7.98105L46.0468 18.1903L50.2529 7.98105H53.9837L47.0003 23.9433H44.9595L37.9761 7.98105H41.8663ZM10.8178 20.14H7.21187V23.9163H10.8178V20.14Z"
            fill="#071219"
          />
        </g>
        <defs>
          <clipPath id="clip0_248_16728">
            <rect width="88" height="24.2759" fill="white" />
          </clipPath>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 8 }}>
        {["Products", "Testimonials", "What we do"].map((item) => (
          <button
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              color: "#1C1C1A",
              fontFamily: "inherit",
              borderRadius: 8,
            }}
          >
            {item}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
            fontSize: 15,
            color: "#1C1C1A",
            fontFamily: "inherit",
            borderRadius: 8,
          }}
        >
          Log in
        </button>
        <button
          style={{
            backgroundColor: "#D4582A",
            color: "white",
            border: "none",
            borderRadius: 100,
            padding: "9px 22px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Book a demo
        </button>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ textAlign: "center", padding: "72px 80px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <span
          style={{
            fontFamily: '"Geist", sans-serif',
            fontSize: 12,
            color: "#6B5E4E",
            border: "1px solid #BFB5A8",
            borderRadius: 100,
            padding: "5px 16px",
            letterSpacing: "0.03em",
          }}
        >
          Automate your property business
        </span>
      </div>

      <h1
        style={{
          fontSize: 62,
          fontWeight: 600,
          lineHeight: 1.08,
          color: "#1C1C1A",
          letterSpacing: "-0.025em",
          maxWidth: 680,
          margin: "0 auto 24px",
        }}
      >
        AI agents that run your property operations
      </h1>

      <p
        style={{
          fontSize: 17,
          lineHeight: 1.65,
          color: "#4A4540",
          maxWidth: 520,
          margin: "0 auto 44px",
        }}
      >
        Haven handles inbound calls, maintenance coordination, and leasing
        follow-up. Your team stays in control. Your PMS stays up to date.
      </p>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <button
          style={{
            backgroundColor: "#D4582A",
            color: "white",
            border: "none",
            borderRadius: 100,
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(212, 88, 42, 0.3)",
          }}
        >
          Book a demo
        </button>
      </div>
    </section>
  );
}

// ─── Bottom ───────────────────────────────────────────────────────────────────
// No React state — houses call the grid imperatively. Zero re-renders on hover.
function BottomSection({
  houseAnim,
  gridAnim,
}: {
  houseAnim: HouseAnimParams;
  gridAnim: GridAnimParams;
}) {
  const pixelBaseRef = useRef<PixelBaseHandle>(null);

  return (
    <section style={{ marginTop: 64, overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          padding: "0 80px",
          gap: 16,
          marginBottom: PG,
        }}
      >
        {HOUSE_CONFIGS.map((h, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "center" }}>
            <PixelHouse
              idleColor={IDLE_COLOR}
              hoverColor={h.hoverColor}
              onHoverChange={(hovered) => pixelBaseRef.current?.setHovered(hovered)}
              anim={houseAnim}
            />
          </div>
        ))}
      </div>

      <PixelBase ref={pixelBaseRef} anim={gridAnim} />
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function V5() {
  const easingOptions = ["ease-in-out", "ease-in", "ease-out", "linear"];

  const p = useDialKit("V5 Animation", {
    houses: {
      transitionDuration: [0.1, 0, 1.5, 0.01],
      easing: { type: "select" as const, options: easingOptions, default: "ease-in-out" },
    },
    grid: {
      flickerMinDuration: [0.5, 0.1, 3.0, 0.05],
      flickerMaxDuration: [1.0, 0.1, 3.0, 0.05],
      flickerMaxDelay:    [0.0, 0.0, 2.0, 0.05],
      fadeOutDuration:    [0.0, 0.0, 2.0, 0.05],
      fadeOutEasing: { type: "select" as const, options: easingOptions, default: "ease-out" },
    },
  });

  return (
    <div
      style={{
        backgroundColor: "#EDE8DC",
        minHeight: "100vh",
        fontFamily: '"Geist", sans-serif',
        overflow: "hidden",
      }}
    >
      <Navbar />
      <Hero />
      <BottomSection
        houseAnim={{ transitionDuration: p.houses.transitionDuration, transitionEasing: p.houses.easing }}
        gridAnim={{
          flickerMinDuration: p.grid.flickerMinDuration,
          flickerMaxDuration: p.grid.flickerMaxDuration,
          flickerMaxDelay:    p.grid.flickerMaxDelay,
          fadeOutDuration:    p.grid.fadeOutDuration,
          fadeOutEasing:      p.grid.fadeOutEasing,
        }}
      />
      <DialRoot />
    </div>
  );
}
