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

// ─── House configs — each house always shows its real color ──────────────────
const HOUSE_CONFIGS = [
  {
    color: '#D86E40',
    shades: ['#D86E40', '#E07848', '#C86030', '#D07038', '#E08050', '#D86E40', '#D86E40'],
  },
  {
    color: '#75927F',
    shades: ['#75927F', '#7D9A87', '#6D8A77', '#658070', '#7D9A87', '#75927F', '#75927F'],
  },
  {
    color: '#C1CFCA',
    shades: ['#C1CFCA', '#B9C7C2', '#C9D7D2', '#B1BFB8', '#C1CFCA', '#C9D7D2', '#B9C7C2'],
  },
  {
    color: '#E8D5B3',
    shades: ['#E8D5B3', '#F0DFC0', '#E0CCB0', '#D8C8A8', '#E8D5B3', '#F0DFC0', '#E8D5B3'],
  },
]

function PixelHouse({
  color,
  onHoverChange,
}: {
  color: string
  onHoverChange: (hovered: boolean) => void
}) {
  const [hovered, setHovered] = useState(false)

  function handleEnter() { setHovered(true); onHoverChange(true) }
  function handleLeave() { setHovered(false); onHoverChange(false) }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
        filter: hovered ? 'brightness(1.18)' : 'brightness(1)',
        transition: 'transform 0.18s ease, filter 0.18s ease',
      }}
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
                backgroundColor: cell ? color : 'transparent',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Pixel base grid — 4 colored zones, one per house ────────────────────────
const BASE_COLS = 96   // enough to bleed past any viewport width
const BASE_ROWS = 26   // enough to fill remaining screen height
const ZONE_COLS = BASE_COLS / 4  // 24 cols per zone

function PixelBase({ hoveredHouse }: { hoveredHouse: number | null }) {
  const { colors, animParams } = useMemo(() => {
    const colors: string[] = []
    const animParams: { duration: number; delay: number }[] = []

    for (let r = 0; r < BASE_ROWS; r++) {
      for (let c = 0; c < BASE_COLS; c++) {
        const zone = Math.min(3, Math.floor(c / ZONE_COLS))
        const { shades } = HOUSE_CONFIGS[zone]
        colors.push(shades[Math.floor(Math.random() * shades.length)])
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
        const col = i % BASE_COLS
        const zone = Math.min(3, Math.floor(col / ZONE_COLS))
        const isActive = hoveredHouse === zone
        const { duration, delay } = animParams[i]

        return (
          <div
            key={i}
            style={{
              width: PX,
              height: PX,
              borderRadius: 3,
              backgroundColor: color,
              animation: isActive
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
              color={h.color}
              onHoverChange={(hovered) => setHoveredHouse(hovered ? i : null)}
            />
          </div>
        ))}
      </div>

      {/* Full-bleed pixel base — no side padding, bleeds edge to edge */}
      <PixelBase hoveredHouse={hoveredHouse} />
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
