import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useId,
} from "react";
import opentype from "opentype.js";

// ─────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────

type Phase = "idle" | "signing" | "accepted";

const FONT_SIZE = 80;
const DRAW_MS = 2200;
const PAD = 16;

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Split an SVG path `d` attribute into individual contours (subpaths).
 *  Each contour starts with an M command and is a single continuous
 *  stroke with no internal moveTo jumps — so getTotalLength() is accurate. */
function splitContours(d: string): string[] {
  return d
    .split(/(?=M)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

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

  // Individual contours (each is a single continuous subpath)
  const [contours, setContours] = useState<string[]>([]);
  const [lengths, setLengths] = useState<number[]>([]);
  const [viewBox, setViewBox] = useState("0 0 100 50");

  const contourRefs = useRef<(SVGPathElement | null)[]>([]);
  const maskId = useId();

  // ── Load font ────────────────────────────────────────────────
  useEffect(() => {
    opentype.load("/fonts/Sacramento-Regular.ttf").then((f) => {
      setFont(f);
      setFontLoaded(true);
    });
  }, []);

  // ── Generate contours from glyphs ────────────────────────────
  // Each glyph path is split into individual contours so that
  // getTotalLength() is accurate (no phantom gaps).
  const generateContours = useCallback(() => {
    if (!font || !name.trim()) return;

    const scale = FONT_SIZE / font.unitsPerEm;
    const ascender = font.ascender * scale;
    const descender = Math.abs(font.descender * scale);
    const height = ascender + descender;

    const glyphs = font.stringToGlyphs(name.trim());
    const allContours: string[] = [];
    let x = 0;

    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];
      const path = glyph.getPath(x, ascender, FONT_SIZE);
      const d = path.toPathData(2);

      if (d && d.length > 5) {
        splitContours(d).forEach((c) => allContours.push(c));
      }

      const advance = (glyph.advanceWidth || 0) * scale;
      const kern =
        i < glyphs.length - 1
          ? font.getKerningValue(glyph, glyphs[i + 1]) * scale
          : 0;
      x += advance + kern;
    }

    setViewBox(`${-PAD} ${-PAD} ${x + PAD * 2} ${height + PAD * 2}`);
    setContours(allContours);
    setLengths([]);
  }, [font, name]);

  // ── Sign handler ─────────────────────────────────────────────
  const handleSign = () => {
    if (!font || !name.trim()) return;
    generateContours();
    setPhase("signing");
  };

  // ── Measure each contour's length (accurate, no gaps) ────────
  useLayoutEffect(() => {
    if (contours.length === 0 || lengths.length > 0) return;
    const measured = contours.map(
      (_, i) => contourRefs.current[i]?.getTotalLength() ?? 50,
    );
    setLengths(measured);
  }, [contours, lengths.length]);

  // ── Auto-transition to accepted ──────────────────────────────
  useEffect(() => {
    if (phase !== "signing" || lengths.length === 0) return;
    const timer = setTimeout(() => setPhase("accepted"), DRAW_MS + 400);
    return () => clearTimeout(timer);
  }, [phase, lengths]);

  // ── Reset ────────────────────────────────────────────────────
  const handleReset = () => {
    setPhase("idle");
    setName("");
    setContours([]);
    setLengths([]);
  };

  const canSign = name.trim().length > 0 && fontLoaded;
  const ready = lengths.length > 0;

  // ── Pre-compute per-contour timing ───────────────────────────
  const totalLength = lengths.reduce((a, b) => a + b, 0);
  const timings: { duration: number; delay: number }[] = [];
  let acc = 0;
  for (const len of lengths) {
    const dur = totalLength > 0 ? (len / totalLength) * DRAW_MS : 0;
    timings.push({ duration: dur, delay: acc });
    acc += dur;
  }

  // ── Signature SVG ────────────────────────────────────────────
  const SignatureSVG = ({ animated }: { animated: boolean }) => (
    <svg
      viewBox={viewBox}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {animated && (
        <defs>
          {contours.map((d, i) => (
            <mask id={`${maskId}-${i}`} key={i}>
              <path
                d={d}
                fill="none"
                stroke="white"
                strokeWidth={FONT_SIZE * 0.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: lengths[i],
                  strokeDashoffset: lengths[i],
                  animation: `trim-path ${timings[i].duration}ms linear ${timings[i].delay}ms forwards`,
                }}
              />
            </mask>
          ))}
        </defs>
      )}
      {contours.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="#ede8e0"
          {...(animated ? { mask: `url(#${maskId}-${i})` } : {})}
        />
      ))}
    </svg>
  );

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
            {phase === "accepted" ? (
              <CheckIcon animated />
            ) : (
              <PencilIcon />
            )}
          </div>

          {/* ── Title & Description ─────────────────────────── */}
          <div className="space-y-3">
            <h2 className="text-[22px] font-heading text-white/90 tracking-[-0.01em] leading-tight">
              {phase === "accepted"
                ? "Contract Signed"
                : "Sign the Contract"}
            </h2>
            <p className="text-[13px] text-white/35 leading-[1.65] font-body">
              {phase === "accepted" ? (
                "Your signature has been recorded. The contract is now in effect."
              ) : (
                <>
                  Since you've read the fine lines, type your name to
                  confirm you agree with{" "}
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

              {/* Hidden SVG for measuring contour lengths */}
              {phase === "signing" && !ready && contours.length > 0 && (
                <svg
                  className="absolute opacity-0 pointer-events-none"
                  viewBox={viewBox}
                >
                  {contours.map((d, i) => (
                    <path
                      key={i}
                      ref={(el) => {
                        contourRefs.current[i] = el;
                      }}
                      d={d}
                    />
                  ))}
                </svg>
              )}

              {/* Animated signature */}
              {phase === "signing" && ready && (
                <div
                  className="w-full h-[60px]"
                  style={{ animation: "fade-in 200ms ease both" }}
                >
                  <SignatureSVG animated />
                </div>
              )}

              {/* Static signature (accepted) */}
              {phase === "accepted" && contours.length > 0 && (
                <div className="w-full h-[60px]">
                  <SignatureSVG animated={false} />
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
      </div>
    </div>
  );
}
