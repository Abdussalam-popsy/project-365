import { useRef, useCallback, useState, useEffect } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

const RAW_WORDS: Array<{ word: string; def: string }> = [
  { word: "taste", def: "The ability to distinguish what's excellent from what's merely good." },
  { word: "moat", def: "A durable competitive advantage that's hard for others to cross." },
  { word: "execution", def: "The relentless discipline of shipping exactly what was promised." },
  { word: "cross-functional", def: "Pulling different disciplines toward a single shared outcome." },
  { word: "leverage", def: "Getting disproportionate output from a fixed input." },
  { word: "narrative", def: "The story that makes strategy legible to everyone in the room." },
  { word: "sequencing", def: "Choosing the right order, because order changes everything." },
  { word: "conviction", def: "Acting on a thesis before the data has confirmed it." },
  { word: "trade-offs", def: "What you consciously accept losing to win somewhere else." },
  { word: "clarity", def: "Removing ambiguity so the team can move fast without asking." },
  { word: "optionality", def: "Preserving future choices by not over-committing today." },
  { word: "signal", def: "Information that actually updates your view of the world." },
  { word: "noise", def: "Activity that feels productive but changes nothing important." },
  { word: "velocity", def: "Rate of value creation — not just speed of output." },
  { word: "alignment", def: "When everyone optimizes for the exact same thing." },
  { word: "insight", def: "A non-obvious truth that creates an unfair advantage." },
  { word: "compounding", def: "Value that accelerates because today's output seeds tomorrow's." },
  { word: "wedge", def: "The narrow entry point that opens a much broader market." },
  { word: "distribution", def: "How a product finds and keeps the people who need it." },
  { word: "defensibility", def: "How hard it is for a competitor to replicate what you built." },
  { word: "surface area", def: "The breadth of touchpoints your product exposes to the world." },
  { word: "timing", def: "The difference between visionary and early — or late." },
  { word: "focus", def: "Saying no to good ideas so the great ones have room." },
  { word: "differentiation", def: "Being distinct in a way that actually matters to users." },
];

// ── Seeded random ─────────────────────────────────────────────────────────────

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Size tiers ────────────────────────────────────────────────────────────────

const SIZES = ["sm", "md", "lg"] as const;
type Size = (typeof SIZES)[number];

const SIZE_STYLES: Record<Size, { fontSize: string; fontWeight: number; fontStyle?: string }> = {
  sm: { fontSize: "0.85rem", fontWeight: 400 },
  md: { fontSize: "1.5rem", fontWeight: 400 },
  lg: { fontSize: "2.75rem", fontWeight: 700, fontStyle: "italic" },
};

function sizeForIndex(i: number): Size {
  const r = seededRand(i * 3 + 7);
  if (r < 0.55) return "sm";
  if (r < 0.90) return "md";
  return "lg";
}

// ── Tag model ─────────────────────────────────────────────────────────────────

interface Tag {
  word: string;
  def: string;
  size: Size;
  left: number; // %
  top: number;  // %
}

const TAGS: Tag[] = RAW_WORDS.map(({ word, def }, i) => ({
  word,
  def,
  size: sizeForIndex(i),
  left: 8 + seededRand(i * 2) * 80,
  top: 8 + seededRand(i * 2 + 1) * 77,
}));

// ── Proximity constants ───────────────────────────────────────────────────────

const MAX_DIST = 220;
const IDLE_OPACITY = 0.28;
const MIN_OPACITY = 0.18;
const MAX_OPACITY = 1;
const MIN_SCALE = 0.92;
const MAX_SCALE = 1.12;

function mapDist(d: number): { scale: number; opacity: number } {
  const t = Math.max(0, Math.min(1, d / MAX_DIST));
  return {
    scale: MAX_SCALE + (MIN_SCALE - MAX_SCALE) * t,
    opacity: MAX_OPACITY + (MIN_OPACITY - MAX_OPACITY) * t,
  };
}

// ── Tooltip position ──────────────────────────────────────────────────────────

interface CardPos {
  top?: number;
  bottom?: number;
  left: number;
}

function positionCard(el: HTMLElement): CardPos {
  const rect = el.getBoundingClientRect();
  const CARD_W = 280;
  const left = Math.min(rect.left, window.innerWidth - CARD_W - 16);
  if (rect.top > 160) {
    return { bottom: window.innerHeight - rect.top + 12, left };
  }
  return { top: rect.bottom + 12, left };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ActiveState {
  word: string;
  def: string;
  pos: CardPos;
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [active, setActive] = useState<ActiveState | null>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  // Sync data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const applyProximity = useCallback((mx: number, my: number) => {
    tagRefs.current.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(mx - cx, my - cy);
      const { scale, opacity } = mapDist(dist);
      el.style.setProperty("--scale", String(scale));
      el.style.setProperty("--opacity", String(opacity));
    });
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (mousePos.current) {
          applyProximity(mousePos.current.x, mousePos.current.y);
        }
      });
    },
    [applyProximity]
  );

  const resetAll = useCallback(() => {
    mousePos.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    tagRefs.current.forEach((el) => {
      if (!el) return;
      el.style.setProperty("--scale", "1");
      el.style.setProperty("--opacity", String(IDLE_OPACITY));
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    resetAll();
    setActive(null);
  }, [resetAll]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg)",
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "Dark" : "Light"}
      </button>

      {TAGS.map((tag, i) => (
        <span
          key={tag.word}
          ref={(el) => {
            tagRefs.current[i] = el;
          }}
          className="word"
          data-hovered={active?.word === tag.word ? "true" : "false"}
          style={
            {
              left: `${tag.left}%`,
              top: `${tag.top}%`,
              ...SIZE_STYLES[tag.size],
              "--scale": "1",
              "--opacity": String(IDLE_OPACITY),
            } as React.CSSProperties
          }
          onMouseEnter={() => {
            const el = tagRefs.current[i];
            if (el) {
              setActive({ word: tag.word, def: tag.def, pos: positionCard(el) });
            }
          }}
          onMouseLeave={() => setActive(null)}
        >
          {tag.word}
        </span>
      ))}

      <div
        className="word-card"
        data-visible={active !== null ? "true" : "false"}
        style={{
          top: active?.pos.top,
          bottom: active?.pos.bottom,
          left: active?.pos.left,
        }}
      >
        <p className="word-card__def">{active?.def}</p>
        <p className="word-card__label">{active?.word}</p>
      </div>
    </div>
  );
}
