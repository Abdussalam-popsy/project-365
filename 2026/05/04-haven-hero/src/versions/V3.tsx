import { useState, useMemo, useRef, useEffect } from 'react'

// ─── Shared pixel size ────────────────────────────────────────────────────────
const PX = 14
const PG = 2

// ─── Animation config ─────────────────────────────────────────────────────────
const ANIM_CONFIG = {
  houseTransitionDuration: '0.5s',
  houseTransitionEasing: 'ease-in-out',
  gridFlickerMinDuration: 0.4,
  gridFlickerMaxDuration: 1.6,
  gridFlickerMaxDelay: 1.0,
  gridFadeOutDuration: '0.8s',
  gridFadeOutEasing: 'ease-out',
} as const

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
                transition: `background-color ${ANIM_CONFIG.houseTransitionDuration} ${ANIM_CONFIG.houseTransitionEasing}`,
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

type GridState = 'idle' | 'active' | 'fading'

function PixelBase({ isHovered }: { isHovered: boolean }) {
  const { colors, animParams } = useMemo(() => {
    const colors: string[] = []
    const animParams: { duration: number; delay: number }[] = []

    for (let r = 0; r < BASE_ROWS; r++) {
      for (let c = 0; c < BASE_COLS; c++) {
        colors.push(BASE_SHADES[Math.floor(Math.random() * BASE_SHADES.length)])
        animParams.push({
          duration: ANIM_CONFIG.gridFlickerMinDuration + Math.random() * (ANIM_CONFIG.gridFlickerMaxDuration - ANIM_CONFIG.gridFlickerMinDuration),
          delay: Math.random() * ANIM_CONFIG.gridFlickerMaxDelay,
        })
      }
    }

    return { colors, animParams }
  }, [])

  const [gridState, setGridState] = useState<GridState>('idle')
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isHovered) {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current)
        fadeTimerRef.current = null
      }
      setGridState('active')
    } else {
      setGridState('fading')
      fadeTimerRef.current = setTimeout(() => {
        setGridState('idle')
        fadeTimerRef.current = null
      }, 800)
    }

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [isHovered])

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
        let animation = 'none'
        if (gridState === 'active') {
          animation = `pixel-flicker ${duration}s ease-in-out ${delay}s infinite`
        } else if (gridState === 'fading') {
          animation = `pixel-flicker-fadeout ${ANIM_CONFIG.gridFadeOutDuration} ${ANIM_CONFIG.gridFadeOutEasing} forwards`
        }
        return (
          <div
            key={i}
            style={{
              width: PX,
              height: PX,
              borderRadius: 3,
              backgroundColor: color,
              animation,
            }}
          />
        )
      })}
    </div>
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
      <svg width="88" height="25" viewBox="0 0 88 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_248_16728)">
          <path fillRule="evenodd" clipRule="evenodd" d="M0 0H3.50764V10.07L9.04555 7.01305L14.5835 10.07V0H18.0911V23.9433H14.5835V13.8462L9.04555 10.7893L3.50764 13.8462V23.9433H0V0ZM69.8532 16.6162L69.9102 15.659L69.9096 15.6383C69.7804 11.055 66.3678 7.50907 61.9811 7.50907C57.533 7.50907 54.0213 11.2188 54.0213 15.8125C54.0213 20.4062 57.5023 24.1159 62.0115 24.1159C64.7892 24.1159 67.232 22.6703 68.6242 20.3135L65.9909 18.5385C65.1121 19.9658 63.6301 20.8349 61.9811 20.8349C59.6233 20.8349 57.6402 19.0372 57.2924 16.6162H69.8532ZM61.9811 10.7901C63.8783 10.7901 65.4532 11.9293 66.1827 13.5926H57.7237C58.4777 11.9094 60.078 10.7901 61.9811 10.7901ZM77.5407 8.4466C76.9187 8.79247 76.3925 9.2414 75.9464 9.77346V7.98105H72.4386V23.9433H75.9464V15.9622C75.9464 12.1884 78.6884 11.153 80.06 11.107C80.9115 11.107 81.664 11.3165 82.3237 11.7388C82.9616 12.1379 83.472 12.7032 83.8543 13.4348C84.2148 14.1664 84.3962 15.0078 84.3962 15.9622V23.9433H88V15.9954C88 14.4225 87.6808 13.0125 87.0429 11.7721C86.3832 10.5084 85.5032 9.5108 84.3962 8.77918C83.2711 8.02427 82.0148 7.64854 80.6335 7.64854C79.4634 7.64854 78.4335 7.91454 77.5407 8.4466ZM32.3925 9.77352C31.9461 9.2414 31.4199 8.79247 30.7981 8.44667C29.9053 7.91454 28.8753 7.64854 27.7051 7.64854C26.3243 7.64854 25.0679 8.02433 23.9423 8.77918C22.8358 9.5108 21.9557 10.5084 21.2956 11.7721C20.6579 13.0125 20.339 14.4225 20.339 15.9954C20.339 17.5684 20.6579 18.9551 21.2956 20.2188C21.9557 21.4592 22.8358 22.4469 23.9423 23.1784C25.0679 23.91 26.3243 24.2759 27.7051 24.2759C28.8753 24.2759 29.9148 24.0198 30.83 23.511C31.4423 23.1552 31.962 22.7129 32.3925 22.1875V23.9433H35.9002V7.98105H32.3925V9.77352ZM31.404 19.4539C30.6164 20.3618 29.5769 20.8173 28.279 20.8173C27.4276 20.8173 26.675 20.6179 26.015 20.2188C25.3773 19.7964 24.867 19.2211 24.4844 18.4895C24.1241 17.7579 23.9423 16.9166 23.9423 15.9622C23.9423 15.0078 24.1241 14.1664 24.4844 13.4348C24.867 12.7033 25.3773 12.1379 26.015 11.7388C26.675 11.3165 27.4276 11.107 28.279 11.107C29.1304 11.107 29.9053 11.3165 30.543 11.7388C31.2031 12.1379 31.7133 12.7033 32.0736 13.4348C32.434 14.1664 32.6157 15.0078 32.6157 15.9622C32.6157 17.3822 32.2108 18.5461 31.404 19.4539ZM41.8663 7.98105L46.0468 18.1903L50.2529 7.98105H53.9837L47.0003 23.9433H44.9595L37.9761 7.98105H41.8663ZM10.8178 20.14H7.21187V23.9163H10.8178V20.14Z" fill="#071219"/>
        </g>
        <defs>
          <clipPath id="clip0_248_16728">
            <rect width="88" height="24.2759" fill="white"/>
          </clipPath>
        </defs>
      </svg>

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
        <span style={{ fontFamily: '"Geist", sans-serif', fontSize: 12, color: '#6B5E4E', border: '1px solid #BFB5A8', borderRadius: 100, padding: '5px 16px', letterSpacing: '0.03em' }}>
          Automate your property business
        </span>
      </div>

      <h1 style={{ fontSize: 62, fontWeight: 600, lineHeight: 1.08, color: '#1C1C1A', letterSpacing: '-0.025em', maxWidth: 680, margin: '0 auto 24px' }}>
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
export default function V3() {
  return (
    <div
      style={{
        backgroundColor: '#EDE8DC',
        minHeight: '100vh',
        fontFamily: '"Geist", sans-serif',
        overflow: 'hidden',
      }}
    >
      <Navbar />
      <Hero />
      <BottomSection />
    </div>
  )
}
