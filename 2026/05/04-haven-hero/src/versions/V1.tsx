import { useState, useMemo } from 'react'

// ─── Shared pixel size — houses and base use the same unit ────────────────────
const PX = 14   // square size in px
const PG = 2    // gap between squares

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

// Cream when idle — same shades as the base grid so they blend in
const HOUSE_IDLE = '#D2C8B4'

function PixelHouse({ hoverColor }: { hoverColor: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
                backgroundColor: cell
                  ? hovered ? hoverColor : HOUSE_IDLE
                  : 'transparent',
                transition: 'background-color 0.18s ease',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Pixel base grid ─────────────────────────────────────────────────────────
// Full-bleed grid of squares, same unit as house pixels, varied cream shades.
const BASE_SHADES = [
  '#DDD5C2', // most common — medium tan
  '#D4CBBA', // slightly darker
  '#E4DECE', // lighter
  '#CAC0AE', // darkest
  '#DDD5C2', // repeat medium to weight it higher
  '#DDD5C2',
  '#E4DECE',
]

const BASE_COLS = 96  // enough to bleed past any viewport width
const BASE_ROWS = 26  // enough to fill remaining screen height

function PixelBase() {
  // Generate once on mount — static, no animation needed
  const colors = useMemo(
    () =>
      Array.from({ length: BASE_ROWS * BASE_COLS }, () =>
        BASE_SHADES[Math.floor(Math.random() * BASE_SHADES.length)]
      ),
    []
  )

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BASE_COLS}, ${PX}px)`,
        gap: PG,
        overflow: 'hidden',
      }}
    >
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            width: PX,
            height: PX,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      ))}
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

  // Auto-cycle every 3 s
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

// ─── Bottom: 4 houses sitting on the pixel base ───────────────────────────────
const HOUSES = [
  { hoverColor: '#D4582A' }, // orange
  { hoverColor: '#7C3AED' }, // purple
  { hoverColor: '#D4582A' }, // orange
  { hoverColor: '#7C3AED' }, // purple
]

function BottomSection() {
  return (
    <section style={{ marginTop: 64, overflow: 'hidden' }}>
      {/*
        4 equal columns — houses sit centered in each column, flush with
        the base grid below. The grid starts at PG (2px) gap after the
        last house row, matching the house's internal row spacing.
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '0 80px',
          gap: 16,
          marginBottom: PG,
        }}
      >
        {HOUSES.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <PixelHouse hoverColor={h.hoverColor} />
          </div>
        ))}
      </div>

      {/* Full-bleed pixel base — no side padding, bleeds edge to edge */}
      <PixelBase />
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function V1() {
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
