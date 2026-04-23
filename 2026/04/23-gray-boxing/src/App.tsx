import { useEffect, useRef, useState } from 'react';
import { useDialKit, DialRoot } from 'dialkit';
import 'dialkit/styles.css';

const LINE_W = 2;
const GAP = 4;
const PADDING_X = 48;

function computeN() {
  return Math.max(1, Math.floor((window.innerWidth - 2 * PADDING_X) / (LINE_W + GAP)));
}

function ScrollLines() {
  const [n, setN] = useState(computeN);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const p = useDialKit('ScrollLines', {
    lines:   [computeN(), 10, 300, 1]    as [number, number, number, number],
    minH:    [4,    1,   40,  1]         as [number, number, number, number],
    maxH:    [160,  40,  400, 1]         as [number, number, number, number],
    spread:  [20,   1,   100, 1]         as [number, number, number, number],
    falloff: [2.0,  0.5, 6.0, 0.1]      as [number, number, number, number],
    lerp:    [0.08, 0.01, 0.5, 0.01]    as [number, number, number, number],
    opacity: [0.5,  0.1, 1.0, 0.05]     as [number, number, number, number],
  });

  const paramsRef = useRef(p);
  useEffect(() => { paramsRef.current = p; });

  // Sync line count from dial override
  const activeN = Math.round(p.lines);

  // Resize observer for dynamic line count
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const next = computeN();
      setN(next);
    });
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  // rAF loop
  useEffect(() => {
    let rafId: number;
    let currentProgress = 0;
    let targetProgress = 0;

    function handleScroll() {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      targetProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }

    function tick() {
      const { lines, minH, maxH, spread, falloff, lerp } = paramsRef.current;
      const count = Math.round(lines);

      currentProgress += (targetProgress - currentProgress) * lerp;
      const peakIndex = currentProgress * (count - 1);

      for (let i = 0; i < count; i++) {
        const el = lineRefs.current[i];
        if (!el) continue;
        const dist = Math.abs(i - peakIndex);
        const t = Math.max(0, 1 - Math.pow(dist / spread, falloff));
        const h = minH + (maxH - minH) * t;
        el.style.height = `${h}px`;
      }

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const displayN = activeN || n;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'flex-end',
        gap: `${GAP}px`,
        padding: `0 ${PADDING_X}px 32px`,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {Array.from({ length: displayN }, (_, i) => (
        <div
          key={i}
          ref={(el) => { lineRefs.current[i] = el; }}
          style={{
            width: `${LINE_W}px`,
            flex: `0 0 ${LINE_W}px`,
            background: `rgba(255,255,255,${p.opacity})`,
            borderRadius: '1px 1px 0 0',
            height: '4px',
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ background: '#191919', minHeight: '100vh', color: '#ccc' }}>
      {/* Hero */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
        }}
      >
        <p style={{ fontSize: '14px', letterSpacing: '0.15em', color: '#666', marginBottom: '24px', textTransform: 'uppercase' }}>
          Scroll experiment
        </p>
        <h1
          style={{
            fontSize: 'clamp(60px, 10vw, 120px)',
            fontWeight: 700,
            lineHeight: 1.05,
            color: '#e8e8e8',
            maxWidth: '900px',
          }}
        >
          Hey, this is<br />a scroll.
        </h1>
      </section>

      {/* Content row */}
      <section style={{ padding: '120px 80px', display: 'flex', gap: '32px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#2a2a2a', borderRadius: '8px', height: '220px' }} />
          <div style={{ background: '#333', borderRadius: '8px', height: '140px' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#2a2a2a', borderRadius: '8px', height: '140px' }} />
          <div style={{ background: '#333', borderRadius: '8px', height: '220px' }} />
        </div>
        <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', paddingLeft: '24px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#ddd', lineHeight: 1.2 }}>
            Motion follows intent.
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#666', maxWidth: '360px' }}>
            The lines below respond to your scroll position in real time — no libraries, no magic.
            Just geometry and a lerp.
          </p>
        </div>
      </section>

      {/* Wide banner */}
      <section style={{ padding: '0 80px 120px' }}>
        <div
          style={{
            background: '#222',
            borderRadius: '12px',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#444', textTransform: 'uppercase' }}>
            Full-width placeholder — grey box
          </p>
        </div>
      </section>

      {/* Two-column */}
      <section style={{ padding: '0 80px 120px', display: 'flex', gap: '64px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.15em', color: '#555', marginBottom: '20px', textTransform: 'uppercase' }}>
            About the interaction
          </p>
          <h2 style={{ fontSize: '40px', fontWeight: 600, color: '#ddd', lineHeight: 1.2, marginBottom: '24px' }}>
            Anchored at the bottom. Growing upward.
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.75, color: '#555', maxWidth: '420px' }}>
            Each line's height is computed from its index and the current scroll progress.
            The curve shape is controlled by an exponent — making the transition feel organic
            rather than mechanical.
          </p>
        </div>
        <div
          style={{
            flex: 1,
            height: '400px',
            background: '#2a2a2a',
            borderRadius: '12px',
          }}
        />
      </section>

      {/* Footer section — extra padding for the fixed bar */}
      <section
        style={{
          padding: '80px 80px 240px',
          borderTop: '1px solid #242424',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#ddd' }}>project-365</p>
          <p style={{ fontSize: '14px', color: '#444', marginTop: '8px' }}>23-gray-boxing</p>
        </div>
        <p style={{ fontSize: '13px', color: '#444', paddingTop: '6px' }}>2026</p>
      </section>

      <ScrollLines />
      <DialRoot />
    </div>
  );
}
