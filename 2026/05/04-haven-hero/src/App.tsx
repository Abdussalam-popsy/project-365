import { useState } from 'react'
import V1 from './versions/V1'
import V2 from './versions/V2'

const VERSIONS = [
  { id: 1, label: 'V1 — Hover Interactions', component: V1 },
  { id: 2, label: 'V2 — Navigation', component: V2 },
]

export default function App() {
  const [current, setCurrent] = useState(1)
  const [open, setOpen] = useState(false)

  const Version = VERSIONS.find(v => v.id === current)!.component

  return (
    <div style={{ position: 'relative' }}>
      <Version />

      {/* ── Floating version switcher ─────────────────────────────────────── */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
        {/* Hamburger button */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Switch version"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            width: 44,
            height: 44,
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 12,
            cursor: 'pointer',
            boxShadow: '0 2px 14px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ display: 'block', width: 18, height: 2, backgroundColor: '#1C1C1A', borderRadius: 2, transition: 'all 0.2s' }} />
          <span style={{ display: 'block', width: 18, height: 2, backgroundColor: '#1C1C1A', borderRadius: 2, transition: 'all 0.2s' }} />
          <span style={{ display: 'block', width: 18, height: 2, backgroundColor: '#1C1C1A', borderRadius: 2, transition: 'all 0.2s' }} />
        </button>

        {/* Dropdown */}
        {open && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 252,
              backgroundColor: 'white',
              borderRadius: 16,
              boxShadow: '0 8px 36px rgba(0,0,0,0.14)',
              border: '1px solid rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 16px 9px',
                borderBottom: '1px solid #f0ece8',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#999',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontFamily: '-apple-system, sans-serif',
                }}
              >
                Versions
              </p>
            </div>

            {VERSIONS.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => { setCurrent(v.id); setOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '13px 16px',
                  background: current === v.id ? '#faf8f6' : 'none',
                  border: 'none',
                  borderBottom: idx < VERSIONS.length - 1 ? '1px solid #f5f2ef' : 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: current === v.id ? '#1C1C1A' : '#666',
                  fontWeight: current === v.id ? 600 : 400,
                  textAlign: 'left',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {v.label}
                {current === v.id && (
                  <span style={{ color: '#D4582A', fontSize: 9 }}>●</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
