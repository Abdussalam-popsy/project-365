import { useState, useEffect, useRef } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from 'framer-motion'

// ─── Assets ───────────────────────────────────────────────────────────────────
import photo1 from './assets/photo-1.jpg'
import photo2 from './assets/photo-2.jpg'
import photo3 from './assets/photo-3.jpg'
import photo4 from './assets/photo-4.jpg'

const IMAGES = [photo1, photo2, photo3, photo4] // photo3 = glasses → becomes polaroid

// X offset from the center of the screen for each photo when fully spread out.
// Based on Figma: 1440px wide canvas, photos at left: 163, 448, 733, 1018, each 260px wide.
// Center of each: 293, 578, 863, 1148. Screen center: 720. Offsets: -427, -142, +143, +428.
const SPREAD_X = [-427, -142, 143, 428]
const CENTER_X = -130 // -260/2: centers a 260px photo on a left:50% anchor

// z-index: glasses photo (index 2) sits on top when stacked
const Z_ORDER = [1, 2, 4, 3]

// Border radius: only the outer ends of the strip are rounded (pill shape)
const STRIP_RADIUS = ['40px 0 0 40px', '0', '0', '0 40px 40px 0']

// ─── Animation phases ─────────────────────────────────────────────────────────
// spread        → initial page load, photos static at their spread positions
// spread-out    → loop restart: photos animate FROM center OUTWARD to spread positions
// converge      → photos animate inward to center (card-stack effect)
// transitioning → cross-fade: strip fades out while polaroid fades in (both visible briefly)
// polaroid      → polaroid card shown, auto-flips to letter
type Phase = 'spread' | 'spread-out' | 'converge' | 'transitioning' | 'polaroid'

// ─── 3D Tilt Hook ─────────────────────────────────────────────────────────────
function useTilt(maxDeg = 12) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [maxDeg, -maxDeg]), {
    stiffness: 260, damping: 28,
  })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-maxDeg, maxDeg]), {
    stiffness: 260, damping: 28,
  })

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  function onMouseLeave() {
    mx.set(0)
    my.set(0)
  }

  return { rotateX, rotateY, onMouseMove, onMouseLeave }
}

// ─── Polaroid Card ────────────────────────────────────────────────────────────
function PolaroidCard({
  isFlipped,
  onAppeared,
  onLetterClick,
}: {
  isFlipped: boolean
  onAppeared: () => void
  onLetterClick: () => void
}) {
  const { rotateX: tiltX, rotateY: tiltY, onMouseMove, onMouseLeave } = useTilt()

  // flipY: 0 = front face (polaroid), 180 = back face (letter)
  const flipY = useMotionValue(0)
  useEffect(() => {
    animate(flipY, isFlipped ? 180 : 0, { type: 'spring', stiffness: 90, damping: 22 })
  }, [isFlipped]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire onAppeared once after entry animation completes
  const onAppearedRef = useRef(onAppeared)
  useEffect(() => {
    const t = setTimeout(() => onAppearedRef.current(), 450)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ perspective: 1200 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Tilt wrapper */}
      <motion.div style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}>
        {/* Flip card */}
        <motion.div
          style={{
            width: 284, height: 338,
            rotateY: flipY,
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          {/* FRONT: Polaroid */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: 20, background: 'white', padding: 12,
            display: 'flex', flexDirection: 'column', gap: 8,
            boxShadow: '0px 100px 43px rgba(0,0,0,0.07), 0px 41.778px 17.964px rgba(0,0,0,0.05), 0px 22.336px 9.605px rgba(0,0,0,0.04), 0px 12.522px 5.384px rgba(0,0,0,0.03)',
          }}>
            <div style={{
              width: 260, height: 270,
              borderRadius: '12px 12px 4px 4px',
              overflow: 'hidden', background: '#fbc7c7', flexShrink: 0,
            }}>
              <img
                src={IMAGES[2]}
                alt="Personal photoshoot"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                draggable={false}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Gambarino, Georgia, serif', fontSize: 24, color: 'black', lineHeight: 'normal' }}>
                2026
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 12, letterSpacing: '-0.36px', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}>
                <span style={{ color: 'black', fontWeight: 300 }}>Personal photoshoot</span>
                <span style={{ color: '#ccc', fontWeight: 500 }}>Jan 3rd</span>
              </div>
            </div>
          </div>

          {/* BACK: Letter — pre-rotated 180° so it faces away initially */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: 20, background: 'white', padding: 12,
              display: 'flex', flexDirection: 'column', gap: 8,
              cursor: 'pointer',
              boxShadow: '0px 100px 43px rgba(0,0,0,0.07), 0px 41.778px 17.964px rgba(0,0,0,0.05), 0px 22.336px 9.605px rgba(0,0,0,0.04), 0px 12.522px 5.384px rgba(0,0,0,0.03)',
              fontFamily: "'Edu AU VIC WA NT Hand', cursive",
              color: '#a3a3a3', fontSize: 12, letterSpacing: '-0.36px', fontWeight: 500, lineHeight: 1.6,
            }}
            onClick={onLetterClick}
          >
            <p style={{ margin: 0, whiteSpace: 'nowrap' }}>Dear Diary,</p>
            <p style={{ margin: 0 }}>
              I have come to you bearing sad news of my recent escapade. A DATE. as you might have
              guessed, it went horribly wrong.
            </p>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
              <span>Much Love, Popsy</span>
              <span>xoxo</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<Phase>('spread')
  const [isFlipped, setIsFlipped] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  // Auto-start: begin converging after a short pause
  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase('converge'), 1200)
    return clearTimer
  }, [])

  // Photos reached center → cross-fade into polaroid
  function handleConvDone() {
    clearTimer()
    // Start the overlap: strip fades out, polaroid fades in simultaneously
    setPhase('transitioning')
    timerRef.current = setTimeout(() => setPhase('polaroid'), 350)
  }

  // Photos finished spreading outward → pause, then converge again
  function handleSpreadOutDone() {
    clearTimer()
    timerRef.current = setTimeout(() => setPhase('converge'), 900)
  }

  // Polaroid appeared → auto-flip to letter
  function handlePolaroidAppeared() {
    clearTimer()
    timerRef.current = setTimeout(() => setIsFlipped(true), 900)
  }

  // Tap the letter → flip back to polaroid, then separate into photos, then loop
  function handleLetterClick() {
    setIsFlipped(false)
    clearTimer()
    // Wait for flip-back animation to finish, then spread the photos outward
    timerRef.current = setTimeout(() => setPhase('spread-out'), 750)
  }

  // Strip stays visible during 'transitioning' so it can fade out alongside the polaroid fading in
  const showStrip = phase !== 'polaroid'
  const showPolaroid = phase === 'polaroid' || phase === 'transitioning'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#f9eecf', overflow: 'hidden' }}>

      {/* Title */}
      <h1 style={{
        position: 'absolute', top: 214, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'Gambarino, Georgia, serif', fontSize: 80, fontWeight: 400,
        color: 'black', whiteSpace: 'nowrap', margin: 0, lineHeight: 'normal',
      }}>
        Photo Diary
      </h1>

      {/* ── Photo strip ── */}
      {showStrip && (
        <div style={{ position: 'absolute', top: 393, left: '50%', height: 270 }}>
          {IMAGES.map((src, i) => (
            <motion.div
              key={i}
              // On 'spread-out': photos remount and start at center, then animate outward.
              // On 'spread' (page load): snap directly to spread positions — no entry animation.
              initial={phase === 'spread-out' ? { x: CENTER_X } : false}
              animate={{
                x: phase === 'converge' || phase === 'transitioning' ? CENTER_X : SPREAD_X[i] + CENTER_X,
                // Fade out during 'transitioning' so the polaroid cross-fades in over the stacked photos
                opacity: phase === 'transitioning' ? 0 : 1,
              }}
              transition={{
                x: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] },
                opacity: { duration: 0.3, ease: 'easeOut' },
              }}
              onAnimationComplete={
                i === 2
                  ? phase === 'converge'   ? handleConvDone
                  : phase === 'spread-out' ? handleSpreadOutDone
                  : undefined
                  : undefined
              }
              style={{
                position: 'absolute', width: 260, height: 270,
                overflow: 'hidden', borderRadius: STRIP_RADIUS[i], zIndex: Z_ORDER[i],
              }}
            >
              <img
                src={src}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                draggable={false}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Polaroid card ── */}
      <AnimatePresence>
        {showPolaroid && (
          <PolaroidCard
            key="polaroid"
            isFlipped={isFlipped}
            onAppeared={handlePolaroidAppeared}
            onLetterClick={handleLetterClick}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 20, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Helvetica, sans-serif', fontSize: 12, color: 'black', margin: 0 }}>
          inspired by retro.app
        </p>
      </div>

    </div>
  )
}
