import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import opentype from "opentype.js";

// ─────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────

type Phase = "idle" | "signing" | "accepted";

const FONT_SIZE = 80;
const DRAW_MS = 2200;
const FILL_DELAY_MS = DRAW_MS - 400;
const FILL_MS = 600;

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

  // Single combined SVG path (not per-glyph)
  const [combinedPath, setCombinedPath] = useState("");
  const [totalLength, setTotalLength] = useState(0);
  const [viewBox, setViewBox] = useState("0 0 100 50");

  const measureRef = useRef<SVGPathElement | null>(null);

  // ── Load font ────────────────────────────────────────────────
  useEffect(() => {
    opentype.load("/fonts/Sacramento-Regular.ttf").then((f) => {
      setFont(f);
      setFontLoaded(true);
    });
  }, []);

  // ── Generate ONE combined path for the entire name ───────────
  const generatePath = useCallback(() => {
    if (!font || !name.trim()) return;

    const scale = FONT_SIZE / font.unitsPerEm;
    const ascender = font.ascender * scale;
    const descender = Math.abs(font.descender * scale);
    const height = ascender + descender;

    // opentype.js gives us a single combined Path for the whole string
    const path = font.getPath(name.trim(), 0, ascender, FONT_SIZE);
    const d = path.toPathData(2);

    // calculate text width for viewBox
    const glyphs = font.stringToGlyphs(name.trim());
    let x = 0;
    for (let i = 0; i < glyphs.length; i++) {
      const advance = (glyphs[i].advanceWidth || 0) * scale;
      const kern =
        i < glyphs.length - 1
          ? font.getKerningValue(glyphs[i], glyphs[i + 1]) * scale
          : 0;
      x += advance + kern;
    }

    const pad = 16;
    setViewBox(`${-pad} ${-pad} ${x + pad * 2} ${height + pad * 2}`);
    setCombinedPath(d);
    setTotalLength(0);
  }, [font, name]);

  // ── Sign handler ─────────────────────────────────────────────
  const handleSign = () => {
    if (!font || !name.trim()) return;
    generatePath();
    setPhase("signing");
  };

  // ── Measure combined path length (before paint) ──────────────
  useLayoutEffect(() => {
    if (!combinedPath || totalLength > 0) return;
    if (measureRef.current) {
      setTotalLength(measureRef.current.getTotalLength());
    }
  }, [combinedPath, totalLength]);

  // ── Auto-transition to accepted ──────────────────────────────
  useEffect(() => {
    if (phase !== "signing" || totalLength === 0) return;
    const timer = setTimeout(
      () => setPhase("accepted"),
      DRAW_MS + 600,
    );
    return () => clearTimeout(timer);
  }, [phase, totalLength]);

  // ── Reset ────────────────────────────────────────────────────
  const handleReset = () => {
    setPhase("idle");
    setName("");
    setCombinedPath("");
    setTotalLength(0);
  };

  const canSign = name.trim().length > 0 && fontLoaded;
  const ready = totalLength > 0;

  // ── Signature SVG (shared between signing & accepted) ────────
  const SignatureSVG = ({ animated }: { animated: boolean }) => (
    <svg
      viewBox={viewBox}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {animated ? (
        <path
          d={combinedPath}
          fill="#ede8e0"
          stroke="#ede8e0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: totalLength,
            strokeDashoffset: totalLength,
            fillOpacity: 0,
            strokeOpacity: 1,
            animation: [
              `write-signature ${DRAW_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
              `reveal-fill ${FILL_MS}ms ease ${FILL_DELAY_MS}ms forwards`,
              `fade-stroke ${FILL_MS}ms ease ${FILL_DELAY_MS}ms forwards`,
            ].join(", "),
          }}
        />
      ) : (
        <path d={combinedPath} fill="#ede8e0" />
      )}
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
            {/* Writing area */}
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

              {/* Hidden measurement SVG */}
              {phase === "signing" && !ready && combinedPath && (
                <svg
                  className="absolute opacity-0 pointer-events-none"
                  viewBox={viewBox}
                >
                  <path ref={measureRef} d={combinedPath} />
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
              {phase === "accepted" && combinedPath && (
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
