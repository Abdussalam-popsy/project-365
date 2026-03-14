import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT_SERIF = "'Lora', Georgia, serif";
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";

// Surface texture: subtle feTurbulence noise for paper grain
const PAPER_NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// Laid-paper crosshatch: fine diagonal lines mimicking real envelope weave
const ENVELOPE_WEAVE = `
  repeating-linear-gradient(
    15deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.04) 2px,
    rgba(0,0,0,0.04) 2.5px
  ),
  repeating-linear-gradient(
    -15deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.04) 2px,
    rgba(0,0,0,0.04) 2.5px
  )
`;

// Initial flap angle: open, triangle visible above envelope body
const FLAP_OPEN = 160;

const softEasing = [0.4, 0.0, 0.2, 1] as const;
const bounceEasing = [0.34, 1.56, 0.64, 1] as const;

// Step timeline:
// 0 = composing    (letter centred on screen, envelope hidden below)
// 1 = meeting      (letter descends, envelope rises — they converge)
// 2 = sealing      (letter inside envelope, flap closes)
// 3 = stamping     (postmark spins in)
// 4 = rocking      (envelope wobbles)
// 5 = flying       (envelope exits screen)
// 6 = confirmation (success message)

const ENVELOPE_HEIGHT = 200;

// How far the envelope sits below screen centre at step 0
const ENVELOPE_OFFSCREEN_Y = 400;
// How far the letter sits above the envelope at step 0 (appears standalone)
const LETTER_COMPOSE_Y = -540;
// Where the letter rests inside the envelope after meeting
const LETTER_INSIDE_Y = 10;

export function LetterComposer() {
  const [step, setStep] = useState(0);
  const [letterContent, setLetterContent] = useState("");

  // Auto-advance steps
  useEffect(() => {
    const timings: Record<number, number> = {
      1: 1000, // meeting duration
      2: 500, // flap close duration
      3: 600, // postmark + pause
      4: 500, // rocking duration
      5: 650, // fly away duration
    };
    const delay = timings[step];
    if (delay != null) {
      const t = setTimeout(() => setStep(step + 1), delay);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleSend = () => {
    if (!letterContent.trim() || step > 0) return;
    setStep(1);
  };

  const handleReset = () => {
    setStep(0);
    setLetterContent("");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-8 relative overflow-hidden"
      style={{
        backgroundColor: "#3d2b1f",
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            rgba(0,0,0,0.03) 50px,
            rgba(0,0,0,0.03) 51px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 50px,
            rgba(0,0,0,0.02) 50px,
            rgba(0,0,0,0.02) 51px
          ),
          radial-gradient(ellipse at 30% 20%, rgba(60,40,25,1) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(50,35,20,1) 0%, transparent 50%),
          linear-gradient(180deg, #3d2b1f 0%, #2a1f15 100%)
        `,
      }}
    >
      {/* Wood grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <AnimatePresence mode="wait">
        {step < 6 ? (
          <motion.div
            key="composer"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="relative z-10"
            style={{
              width: "90vw",
              maxWidth: "440px",
            }}
          >
            {/*
              ENVELOPE ASSEMBLY
              At step 0: sits 400px below centre (off-screen).
              At step 1: rises to centre (y: 0).
              The letter is a child inside, so it rides along.
              At step 0 the letter compensates with a large negative y
              to appear standalone and centred on screen.
            */}
            <motion.div
              className="relative"
              animate={{
                y: step === 0 ? ENVELOPE_OFFSCREEN_Y : step >= 5 ? -800 : 0,
                x: step >= 5 ? 120 : 0,
                rotate: step >= 5 ? 10 : 0,
              }}
              transition={{
                duration: step === 1 ? 1.0 : step >= 5 ? 0.65 : 0,
                ease: step >= 5 ? [0.55, 0, 1, 0.45] : softEasing,
              }}
              style={{
                height: ENVELOPE_HEIGHT,
                perspective: "1000px",
                // Clipping phases:
                // step 0: visible (letter floats above)
                // step 1: clip bottom only (letter entering from top)
                // step 2+: clip all sides permanently (letter hidden inside,
                //   fly-away is on THIS div so the whole clipped box moves)
                overflow: step >= 2 ? "hidden" : "visible",
                clipPath: step === 1 ? "inset(-200% -200% 0 -200%)" : "none",
              }}
            >
              {/* Assembly inner — handles rocking only */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  rotate: step === 4 ? [0, 4, -4, 3, -2, 0] : 0,
                }}
                transition={{
                  duration: step === 4 ? 0.5 : 0.3,
                  ease: "easeInOut",
                }}
              >
                {/* ENVELOPE BACK — z:10 */}
                <div
                  className="absolute inset-0"
                  style={{
                    zIndex: 10,
                    backgroundColor: "#e8dcc8",
                    backgroundImage: ENVELOPE_WEAVE,
                    borderRadius: "4px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Paper noise on envelope back */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: PAPER_NOISE,
                      opacity: 0.035,
                      borderRadius: "4px",
                    }}
                  />
                  <div
                    className="absolute rounded"
                    style={{
                      inset: "16px",
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.12) 100%)",
                    }}
                  />
                </div>

                {/*
                  THE LETTER — z:20
                  Step 0: y = LETTER_COMPOSE_Y (-540px above envelope).
                    Since envelope is 400px below centre, the letter appears
                    at roughly -540 + 400 = -140px from centre — floating
                    as a standalone sheet of paper on the desk.
                  Step 1+: y = 10 (inside the envelope).
                    Both the envelope rising and the letter descending happen
                    simultaneously during step 1.
                */}
                <motion.div
                  className="absolute inset-x-0 origin-top"
                  style={{ zIndex: 20 }}
                  animate={{
                    y: step === 0 ? LETTER_COMPOSE_Y : LETTER_INSIDE_Y,
                  }}
                  transition={{
                    duration: step <= 1 ? 1.0 : 0,
                    ease: softEasing,
                  }}
                >
                  <div
                    className="relative w-full rounded-sm overflow-hidden"
                    style={{
                      padding: "32px 32px 24px 32px",
                      backgroundColor: "#f5f0e6",
                      backgroundImage: `
                        linear-gradient(180deg, #f8f4eb 0%, #f2ead8 100%),
                        repeating-linear-gradient(
                          0deg,
                          transparent,
                          transparent 31px,
                          #e8dcc8 31px,
                          #e8dcc8 32px
                        )
                      `,
                      boxShadow: `
                        0 25px 50px -12px rgba(0, 0, 0, 0.4),
                        0 12px 24px -8px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.5)
                      `,
                    }}
                  >
                    {/* Paper noise texture overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none rounded-sm"
                      style={{
                        backgroundImage: PAPER_NOISE,
                        opacity: 0.045,
                      }}
                    />

                    {/* Decorative double-line border — period stationery motif */}
                    <div
                      className="absolute pointer-events-none rounded-sm"
                      style={{
                        inset: "8px",
                        border: "1px solid rgba(201, 184, 150, 0.45)",
                      }}
                    >
                      <div
                        className="absolute rounded-sm"
                        style={{
                          inset: "3px",
                          border: "1px solid rgba(201, 184, 150, 0.2)",
                        }}
                      />
                    </div>

                    {/* Letterhead rule */}
                    <div
                      className="relative h-px w-full"
                      style={{
                        marginBottom: "24px",
                        background:
                          "linear-gradient(90deg, transparent, #c9b896 20%, #c9b896 80%, transparent)",
                      }}
                    />

                    {/* Lined paper background */}
                    <div className="relative">
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 31px,
                            #e0d4c0 31px,
                            #e0d4c0 32px
                          )`,
                        }}
                      />

                      <textarea
                        value={letterContent}
                        onChange={(e) => setLetterContent(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="My dearest..."
                        disabled={step > 0}
                        className="relative w-full resize-none bg-transparent border-none outline-none disabled:cursor-default"
                        style={{
                          minHeight: "288px",
                          fontFamily: FONT_SERIF,
                          fontSize: "18px",
                          lineHeight: "32px",
                          color: "#3d2b1f",
                          caretColor: "#5c4033",
                        }}
                      />
                    </div>

                    {/* Send Button */}
                    <AnimatePresence>
                      {step === 0 && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          onClick={handleSend}
                          disabled={!letterContent.trim()}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative w-full rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            marginTop: "24px",
                            padding: "12px 24px",
                            fontFamily: FONT_SERIF,
                            fontSize: "16px",
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                            backgroundColor: "#3d2b1f",
                            color: "#f5f0e6",
                            boxShadow:
                              "0 4px 12px rgba(61, 43, 31, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                          }}
                        >
                          Send Letter
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* ENVELOPE FRONT (POCKET) — z:30, V-shaped face */}
                <div
                  className="absolute bottom-0 left-0 right-0 overflow-hidden"
                  style={{
                    zIndex: 30,
                    height: ENVELOPE_HEIGHT * 0.85,
                    borderRadius: "0 0 4px 4px",
                  }}
                >
                  {/* Crosshatch texture on front pocket */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: ENVELOPE_WEAVE,
                      zIndex: 1,
                    }}
                  />

                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #f2ead8 0%, #f8f4eb 100%)",
                      clipPath:
                        "polygon(0 30%, 50% 100%, 100% 30%, 100% 100%, 0 100%)",
                    }}
                  />

                  {/* Left diagonal fold */}
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: "50%",
                      background:
                        "linear-gradient(135deg, #efe7d5 0%, #f5f0e6 50%, transparent 50%)",
                    }}
                  />

                  {/* Right diagonal fold */}
                  <div
                    className="absolute top-0 right-0 h-full"
                    style={{
                      width: "50%",
                      background:
                        "linear-gradient(-135deg, #efe7d5 0%, #f5f0e6 50%, transparent 50%)",
                    }}
                  />

                  {/* Bottom edge highlight */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                    }}
                  />
                </div>

                {/* STAMP — on the envelope front, top-right corner */}
                <div
                  className="absolute"
                  style={{
                    zIndex: 35,
                    top: 40,
                    right: 12,
                  }}
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      width: "42px",
                      height: "52px",
                      backgroundColor: "#faf6ed",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      borderRadius: "2px",
                    }}
                  >
                    {/* Perforations */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `
                          radial-gradient(circle at 0 4px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 0 12px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 0 20px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 0 28px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 0 36px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 0 44px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 0 52px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 42px 4px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 42px 12px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 42px 20px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 42px 28px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 42px 36px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 42px 44px, transparent 2px, #faf6ed 2px),
                          radial-gradient(circle at 42px 52px, transparent 2px, #faf6ed 2px)
                        `,
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                    {/* Stamp face */}
                    <div
                      className="relative flex items-center justify-center overflow-hidden"
                      style={{
                        width: "32px",
                        height: "40px",
                        backgroundColor: "#c9a86c",
                        backgroundImage: `
                          radial-gradient(circle, rgba(74,55,40,0.12) 0.5px, transparent 0.5px),
                          linear-gradient(135deg, #d4b377 0%, #b8945a 100%)
                        `,
                        backgroundSize: "4px 4px, 100% 100%",
                        border: "2px solid rgba(74, 55, 40, 0.25)",
                        boxShadow: "inset 0 0 0 1px rgba(212, 179, 119, 0.4)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_SERIF,
                          fontSize: "14px",
                          color: "#4a3728",
                        }}
                      >
                        &#9993;
                      </span>
                    </div>
                  </div>
                </div>

                {/* TOP FLAP — z-index animates with step */}
                <motion.div
                  className="absolute left-0 right-0 origin-top"
                  animate={{
                    rotateX: step >= 2 ? 0 : FLAP_OPEN,
                  }}
                  transition={{ duration: 0.5, ease: softEasing }}
                  style={{
                    zIndex: step >= 2 ? 40 : 5,
                    top: -1,
                    height: ENVELOPE_HEIGHT * 0.55,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Front face of flap (visible when closed) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                      background:
                        "linear-gradient(180deg, #f5f0e6 0%, #e8dcc8 100%)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {/* Crosshatch on flap front */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: ENVELOPE_WEAVE,
                        clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                      }}
                    />
                  </div>
                  {/* Back face of flap (visible when open) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                      background:
                        "linear-gradient(0deg, #d4c8b4 0%, #efe7d5 100%)",
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                    }}
                  />
                </motion.div>

                {/* POSTMARK — z:50, spins in after flap closes */}
                <motion.div
                  className="absolute"
                  animate={{
                    scale: step >= 3 ? 1 : 0,
                    rotate: step >= 3 ? -12 : -30,
                  }}
                  transition={{ duration: 0.25, ease: bounceEasing }}
                  style={{
                    zIndex: 50,
                    top: 24,
                    right: 80,
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: "48px",
                      height: "48px",
                      border: "2px solid #8b4513",
                    }}
                  >
                    <div
                      className="flex flex-col items-center justify-center rounded-full"
                      style={{
                        width: "40px",
                        height: "40px",
                        border: "1px solid #8b4513",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_SERIF,
                          fontSize: "7px",
                          color: "#8b4513",
                          fontWeight: 600,
                          lineHeight: 1.2,
                          textAlign: "center",
                        }}
                      >
                        {new Date()
                          .toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })
                          .toUpperCase()}
                        <br />'{String(new Date().getFullYear()).slice(-2)}
                      </span>
                    </div>
                  </div>
                  {/* Postmark lines */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col"
                    style={{ right: "-16px", gap: "2px" }}
                  >
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: "1.5px",
                          width: "14px",
                          backgroundColor: "#8b4513",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="confirmation"
            className="relative z-10 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: softEasing }}
            style={{ padding: "48px 32px" }}
          >
            {/* Decorative rule — echoes the letterhead */}
            <div
              style={{
                width: "64px",
                height: "1px",
                marginBottom: "32px",
                background:
                  "linear-gradient(90deg, transparent, #c9b896, transparent)",
              }}
            />

            <p
              style={{
                fontFamily: FONT_DISPLAY,
                fontStyle: "italic",
                fontSize: "24px",
                color: "#f5f0e6",
                marginBottom: "16px",
              }}
            >
              Your letter is on its way.
            </p>
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontSize: "14px",
                color: "#c9b896",
                letterSpacing: "0.05em",
              }}
            >
              Arriving soon
            </p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={handleReset}
              whileHover={{
                backgroundColor: "#a0522d",
                boxShadow:
                  "0 6px 16px rgba(139, 69, 19, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
              whileTap={{ scale: 0.97 }}
              className="rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                marginTop: "48px",
                padding: "14px 32px",
                fontFamily: FONT_SERIF,
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: "0.03em",
                color: "#f5f0e6",
                backgroundColor: "#8b4513",
                border: "1px solid #a0522d",
                boxShadow:
                  "0 4px 12px rgba(139, 69, 19, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                // @ts-expect-error Tailwind ring-offset-color via CSS var
                "--tw-ring-color": "#c9b896",
                "--tw-ring-offset-color": "#3d2b1f",
              }}
            >
              Write another letter
            </motion.button>

            {/* Bottom decorative rule */}
            <div
              style={{
                width: "32px",
                height: "1px",
                marginTop: "32px",
                background:
                  "linear-gradient(90deg, transparent, rgba(201,184,150,0.4), transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
