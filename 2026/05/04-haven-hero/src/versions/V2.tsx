import { useState, useMemo } from 'react'

// ─── Shared pixel size ────────────────────────────────────────────────────────
const PX = 14
const PG = 2

// ─── Pixel house bitmap (13 cols × 13 rows) ──────────────────────────────────
const HOUSE_MAP: number[][] = [
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,0,0,0,1,1,1,0,0,0,1,1],
  [1,1,0,0,0,1,1,1,0,0,0,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,0,0,0,0,0,1,1,1,1],
  [1,1,1,1,0,0,0,0,0,1,1,1,1],
]

const IDLE_COLOR = '#D2C8B4'

// ─── House configs — cream by default, color on hover ────────────────────────
const HOUSE_CONFIGS = [
  { hoverColor: '#D86E40' },
  { hoverColor: '#75927F' },
  { hoverColor: '#C1CFCA' },
  { hoverColor: '#E8D5B3' },
]

function PixelHouse({
  idleColor,
  hoverColor,
  onHoverChange,
}: {
  idleColor: string
  hoverColor: string
  onHoverChange: (h: boolean) => void
}) {
  const [hovered, setHovered] = useState(false)

  function handleEnter() { setHovered(true); onHoverChange(true) }
  function handleLeave() { setHovered(false); onHoverChange(false) }

  const activeColor = hovered ? hoverColor : idleColor

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ cursor: 'pointer', display: 'inline-block' }}
    >
      {HOUSE_MAP.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: PG, marginBottom: PG }}>
          {row.map((cell, ci) => (
            <div
              key={ci}
              style={{
                width: PX,
                height: PX,
                borderRadius: 3,
                backgroundColor: cell ? activeColor : 'transparent',
                transition: 'background-color 0.18s ease',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Pixel base grid — uniform cream, flickers when any house is hovered ──────
const BASE_COLS = 96
const BASE_ROWS = 26
const BASE_SHADES = ['#DDD5C2', '#D4CBBA', '#E4DECE', '#CAC0AE']

function PixelBase({ isHovered }: { isHovered: boolean }) {
  const { colors, animParams } = useMemo(() => {
    const colors: string[] = []
    const animParams: { duration: number; delay: number }[] = []

    for (let r = 0; r < BASE_ROWS; r++) {
      for (let c = 0; c < BASE_COLS; c++) {
        colors.push(BASE_SHADES[Math.floor(Math.random() * BASE_SHADES.length)])
        animParams.push({
          duration: 0.4 + Math.random() * 1.2,
          delay: Math.random() * 1.0,
        })
      }
    }

    return { colors, animParams }
  }, [])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BASE_COLS}, ${PX}px)`,
        gap: PG,
        overflow: 'hidden',
      }}
    >
      {colors.map((color, i) => {
        const { duration, delay } = animParams[i]
        return (
          <div
            key={i}
            style={{
              width: PX,
              height: PX,
              borderRadius: 3,
              backgroundColor: color,
              animation: isHovered
                ? `pixel-flicker ${duration}s ease-in-out ${delay}s infinite`
                : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Random Button ────────────────────────────────────────────────────────────
const RANDOM_LABELS = [
  '⟳ Randomize', '◎ Explore', '⊕ Generate', '⟳ Shuffle',
  '◈ Compute', '⊗ Discover', '⟳ Automate', '◉ Transform',
  '⊞ Synthesize', '⟲ Iterate',
]

function RandomButton() {
  const [label, setLabel] = useState(RANDOM_LABELS[0])
  const [glitching, setGlitching] = useState(false)

  function trigger() {
    let count = 0
    setGlitching(true)
    const t = setInterval(() => {
      setLabel(RANDOM_LABELS[Math.floor(Math.random() * RANDOM_LABELS.length)])
      count++
      if (count >= 7) { clearInterval(t); setGlitching(false) }
    }, 55)
  }

  useState(() => { const id = setInterval(trigger, 3000); return () => clearInterval(id) })

  return (
    <button
      onClick={trigger}
      style={{
        background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        color: 'white',
        border: 'none',
        borderRadius: 100,
        padding: '12px 28px',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: glitching ? '0.06em' : '0.01em',
        opacity: glitching ? 0.8 : 1,
        transition: glitching ? 'none' : 'all 0.2s ease',
        boxShadow: '0 4px 20px rgba(29, 78, 216, 0.38)',
        fontFamily: 'inherit',
        minWidth: 160,
      }}
    >
      {label}
    </button>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 80px',
        height: 65,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: '#1C1C1A' }}>
        h<span style={{ color: '#D4582A' }}>:</span>aven
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {['Products', 'Testimonials', 'What we do'].map(item => (
          <button
            key={item}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 10px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 15, color: '#1C1C1A',
              fontFamily: 'inherit', borderRadius: 8,
            }}
          >
            {item}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', fontSize: 15, color: '#1C1C1A', fontFamily: 'inherit', borderRadius: 8 }}>
          Log in
        </button>
        <button style={{ backgroundColor: '#D4582A', color: 'white', border: 'none', borderRadius: 100, padding: '9px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Book a demo
        </button>
      </div>
    </nav>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ textAlign: 'center', padding: '72px 80px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B5E4E', border: '1px solid #BFB5A8', borderRadius: 100, padding: '5px 16px', letterSpacing: '0.03em' }}>
          Automate your property business
        </span>
      </div>

      <h1 style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.08, color: '#1C1C1A', letterSpacing: '-0.025em', maxWidth: 680, margin: '0 auto 24px' }}>
        AI agents that run your property operations
      </h1>

      <p style={{ fontSize: 17, lineHeight: 1.65, color: '#4A4540', maxWidth: 520, margin: '0 auto 44px' }}>
        Haven handles inbound calls, maintenance coordination, and leasing
        follow-up. Your team stays in control. Your PMS stays up to date.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <button style={{ backgroundColor: '#D4582A', color: 'white', border: 'none', borderRadius: 100, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(212, 88, 42, 0.3)' }}>
          Book a demo
        </button>
        <RandomButton />
      </div>
    </section>
  )
}

// ─── Bottom: 4 cream houses on uniform cream base ─────────────────────────────
function BottomSection() {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null)

  return (
    <section style={{ marginTop: 64, overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '0 80px',
          gap: 16,
          marginBottom: PG,
        }}
      >
        {HOUSE_CONFIGS.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <PixelHouse
              idleColor={IDLE_COLOR}
              hoverColor={h.hoverColor}
              onHoverChange={(hovered) => setHoveredHouse(hovered ? i : null)}
            />
          </div>
        ))}
      </div>

      <PixelBase isHovered={hoveredHouse !== null} />
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function V2() {
  return (
    <div
      style={{
        backgroundColor: '#EDE8DC',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <Navbar />
      <Hero />
      <BottomSection />
    </div>
  )
}
