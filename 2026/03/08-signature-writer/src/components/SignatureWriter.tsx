import {
  useState,
  useEffect,
  useCallback,
  useId,
  useMemo,
  useRef,
} from "react";
import opentype from "opentype.js";

// ─────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────

type Phase = "idle" | "signing" | "accepted";

interface ContourData {
  d: string;
  length: number;
}

const FONT_SIZE = 80;
const DRAW_MS = 2200;
const PAD = 16;
const DEV_SLIDER = true;

/** Easing: fast attack, smooth decel — mimics pen pressure */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Split an SVG path `d` attribute into individual contours (subpaths). */
function splitContours(d: string): string[] {
  return d
    .split(/(?=M)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

/** Measure a path's length without ever rendering it to the DOM.
 *  Uses an offscreen SVG namespace element — no layout thrash. */
const measurePath = (() => {
  let svg: SVGSVGElement | null = null;
  let pathEl: SVGPathElement | null = null;

  return (d: string): number => {
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svg.appendChild(pathEl);
      // Append to body but keep invisible — required for getTotalLength()
      svg.style.position = "absolute";
      svg.style.width = "0";
      svg.style.height = "0";
      svg.style.overflow = "hidden";
      svg.style.opacity = "0";
      svg.style.pointerEvents = "none";
      document.body.appendChild(svg);
    }
    pathEl!.setAttribute("d", d);
    return pathEl!.getTotalLength();
  };
})();

// ─────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function CheckIcon({ animated = false }: { animated?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline
        points="20 6 9 17 4 12"
        {...(animated
          ? {
              style: {
                strokeDasharray: 25,
                strokeDashoffset: 25,
                animation: "draw-check 500ms ease-out 300ms forwards",
              },
            }
          : {})}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export default function SignatureWriter() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [font, setFont] = useState<opentype.Font | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Full combined path for proper filled rendering (holes stay hollow)
  const [fullPath, setFullPath] = useState("");
  // Split contours used only for the mask animation
  const [contours, setContours] = useState<ContourData[]>([]);
  const [viewBox, setViewBox] = useState("0 0 100 50");

  const maskId = useId();

  // ── Progress-driven animation refs ────────────────────────────
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);
  const maskPathsRef = useRef<(SVGPathElement | null)[]>([]);
  const scrubbing = useRef(false);
  const [sliderValue, setSliderValue] = useState(0);

  // ── Load font ────────────────────────────────────────────────
  useEffect(() => {
    opentype.load("/fonts/Sacramento-Regular.ttf").then((f) => {
      setFont(f);
      setFontLoaded(true);
    });
  }, []);

  // ── Generate contours + measure lengths in one pass ──────────
  const generateContours = useCallback((): {
    full: string;
    contours: ContourData[];
  } => {
    if (!font || !name.trim()) return { full: "", contours: [] };

    const scale = FONT_SIZE / font.unitsPerEm;
    const ascender = font.ascender * scale;
    const descender = Math.abs(font.descender * scale);
    const height = ascender + descender;

    const glyphs = font.stringToGlyphs(name.trim());
    const result: ContourData[] = [];
    const fullParts: string[] = [];
    let x = 0;

    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];
      const path = glyph.getPath(x, ascender, FONT_SIZE);
      const d = path.toPathData(2);

      if (d && d.length > 5) {
        fullParts.push(d);
        for (const contour of splitContours(d)) {
          result.push({
            d: contour,
            length: measurePath(contour),
          });
        }
      }

      const advance = (glyph.advanceWidth || 0) * scale;
      const kern =
        i < glyphs.length - 1
          ? font.getKerningValue(glyph, glyphs[i + 1]) * scale
          : 0;
      x += advance + kern;
    }

    setViewBox(`${-PAD} ${-PAD} ${x + PAD * 2} ${height + PAD * 2}`);
    return { full: fullParts.join(" "), contours: result };
  }, [font, name]);

  // ── Pre-compute per-contour progress windows ─────────────────
  const contourWindows = useMemo(() => {
    const totalLength = contours.reduce((a, c) => a + c.length, 0);
    if (totalLength === 0) return [];
    const result: { start: number; end: number }[] = [];
    let acc = 0;
    for (const { length } of contours) {
      const start = acc / totalLength;
      const end = (acc + length) / totalLength;
      result.push({ start, end });
      acc += length;
    }
    return result;
  }, [contours]);

  // ── Apply progress to mask paths (no React re-render) ────────
  const applyProgress = useCallback(
    (progress: number) => {
      for (let i = 0; i < contours.length; i++) {
        const el = maskPathsRef.current[i];
        if (!el) continue;
        const w = contourWindows[i];
        if (!w) continue;
        const local = clamp((progress - w.start) / (w.end - w.start), 0, 1);
        const offset = contours[i].length * (1 - local);
        el.style.strokeDashoffset = `${offset}`;
      }
    },
    [contours, contourWindows],
  );

  // ── Sign handler ─────────────────────────────────────────────
  const handleSign = () => {
    if (!font || !name.trim()) return;

    const { full, contours: newContours } = generateContours();
    setFullPath(full);
    setContours(newContours);
    setPhase("signing");

    // Pre-compute windows for the rAF closure (avoids stale React state)
    const totalLength = newContours.reduce((a, c) => a + c.length, 0);
    const windows: { start: number; end: number }[] = [];
    let acc = 0;
    for (const { length } of newContours) {
      windows.push({
        start: acc / totalLength,
        end: (acc + length) / totalLength,
      });
      acc += length;
    }

    progressRef.current = 0;
    scrubbing.current = false;
    setSliderValue(0);

    cancelAnimationFrame(rafRef.current);
    // Wait for React to paint the SVG before starting
    requestAnimationFrame(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        if (scrubbing.current) return;
        const elapsed = now - startTime;
        const raw = clamp(elapsed / DRAW_MS, 0, 1);
        const eased = easeInOutCubic(raw);
        progressRef.current = eased;
        setSliderValue(eased);
        // Apply directly — no stale closure dependency
        for (let i = 0; i < newContours.length; i++) {
          const el = maskPathsRef.current[i];
          if (!el) continue;
          const w = windows[i];
          const local = clamp((eased - w.start) / (w.end - w.start), 0, 1);
          el.style.strokeDashoffset = `${newContours[i].length * (1 - local)}`;
        }
        if (raw < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setTimeout(() => setPhase("accepted"), 400);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    });
  };

  // Clean up rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Reset ────────────────────────────────────────────────────
  const handleReset = () => {
    cancelAnimationFrame(rafRef.current);
    scrubbing.current = false;
    progressRef.current = 0;
    setSliderValue(0);
    setPhase("idle");
    setName("");
    setFullPath("");
    setContours([]);
  };

  const canSign = name.trim().length > 0 && fontLoaded;

  return (
    <div className="min-h-screen grid place-items-center bg-[#141414] p-6 font-body antialiased selection:bg-white/10">
      <div className="w-full max-w-[420px]">
        <div
          className={`
            bg-[#1c1c1c] border rounded-2xl p-7 flex flex-col gap-6
            shadow-2xl shadow-black/50 transition-colors duration-700
            ${phase === "accepted" ? "border-emerald-500/10" : "border-white/[0.06]"}
          `}
        >
          {/* ── Icon Badge ──────────────────────────────────── */}
          <div
            className={`
              size-10 rounded-full grid place-items-center border
              transition-all duration-700
              ${
                phase === "accepted"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.03] border-white/[0.06] text-white/40"
              }
            `}
          >
            {phase === "accepted" ? <CheckIcon animated /> : <PencilIcon />}
          </div>

          {/* ── Title & Description ─────────────────────────── */}
          <div className="space-y-3">
            <h2 className="text-[22px] font-heading text-white/90 tracking-[-0.01em] leading-tight">
              {phase === "accepted" ? "Contract Signed" : "Sign the Contract"}
            </h2>
            <p className="text-[13px] text-white/35 leading-[1.65] font-body">
              {phase === "accepted" ? (
                "Your signature has been recorded. The contract is now in effect."
              ) : (
                <>
                  Since you've read the fine lines, type your name to confirm
                  you agree with{" "}
                  <span className="text-white/55">the terms</span>.
                </>
              )}
            </p>
          </div>

          {/* ── Signature Pad ───────────────────────────────── */}
          <div className="relative bg-[#111] border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 min-h-[96px] flex items-center justify-center">
              {/* Input (idle) */}
              {phase === "idle" && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && canSign && handleSign()
                  }
                  placeholder="Your full name"
                  disabled={!fontLoaded}
                  autoFocus
                  className="w-full bg-transparent text-[#ede8e0] text-[34px] font-signature text-center outline-none placeholder:text-white/[0.12] disabled:opacity-30 leading-none"
                />
              )}

              {/* Animated signature (signing) */}
              {phase === "signing" && fullPath && (
                <div
                  className="w-full h-[60px]"
                  style={{ animation: "fade-in 200ms ease both" }}
                >
                  <svg
                    viewBox={viewBox}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <mask id={`${maskId}-full`}>
                        {contours.map(({ d, length }, i) => (
                          <path
                            key={i}
                            ref={(el) => {
                              maskPathsRef.current[i] = el;
                            }}
                            d={d}
                            fill="none"
                            stroke="white"
                            strokeWidth={FONT_SIZE * 0.6}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              strokeDasharray: length,
                              strokeDashoffset: length,
                            }}
                          />
                        ))}
                      </mask>
                    </defs>
                    <path
                      d={fullPath}
                      fill="#ede8e0"
                      mask={`url(#${maskId}-full)`}
                    />
                  </svg>
                </div>
              )}

              {/* Static signature (accepted) */}
              {phase === "accepted" && fullPath && (
                <div className="w-full h-[60px]">
                  <svg
                    viewBox={viewBox}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <path d={fullPath} fill="#ede8e0" />
                  </svg>
                </div>
              )}
            </div>

            {/* Signature line */}
            <div className="mx-5 h-px bg-white/[0.06]" />

            {/* Label */}
            <p className="text-center text-[9px] text-white/[0.15] uppercase tracking-[0.25em] py-2.5 font-body select-none">
              Signature
            </p>
          </div>

          {/* ── Button ──────────────────────────────────────── */}
          {phase === "accepted" ? (
            <button
              onClick={handleReset}
              className="
                w-full h-11 rounded-xl text-[13px] font-medium font-body
                bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/15
                cursor-pointer hover:bg-emerald-500/[0.12]
                active:scale-[0.98] transition-all duration-200
              "
            >
              Accepted
            </button>
          ) : (
            <button
              onClick={handleSign}
              disabled={!canSign || phase === "signing"}
              className="
                w-full h-11 rounded-xl text-[13px] font-medium font-body
                bg-white text-[#111] cursor-pointer
                hover:bg-white/90 active:scale-[0.98]
                disabled:opacity-20 disabled:cursor-not-allowed disabled:active:scale-100
                transition-all duration-200
              "
            >
              {phase === "signing" ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="size-1.5 rounded-full bg-current"
                    style={{ animation: "pulse-dot 1.2s ease infinite" }}
                  />
                  Signing
                </span>
              ) : (
                "Sign & Accept"
              )}
            </button>
          )}
        </div>

        {/* ── Dev scrub slider ─────────────────────────────── */}
        {DEV_SLIDER && phase === "signing" && (
          <div className="mt-4 flex items-center gap-3 px-1">
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={sliderValue}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                // Pause rAF playback — slider takes over
                scrubbing.current = true;
                cancelAnimationFrame(rafRef.current);
                progressRef.current = v;
                setSliderValue(v);
                applyProgress(v);
              }}
              className="flex-1 h-1 accent-white/60 cursor-pointer"
            />
            <span className="text-[11px] text-white/30 tabular-nums w-10 text-right font-body">
              {(sliderValue * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
