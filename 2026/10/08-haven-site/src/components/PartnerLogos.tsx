import type { ReactNode } from "react";

/**
 * Placeholder customer wordmarks, monochrome via currentColor.
 * `textLength` pins each word's width so the viewBox never clips, whatever font loads.
 */
type Mark = { width: number; art: ReactNode };

const sans = "var(--font-inter-tight), system-ui, sans-serif";

const marks: Record<string, Mark> = {
  Rentor: {
    width: 118,
    art: (
      <>
        <rect x="1" y="3" width="26" height="26" rx="7" fill="currentColor" />
        <path d="M7.5 18 14 11.5 20.5 18" stroke="var(--color-ink)" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="35" y="24" fontFamily={sans} fontSize="22" fontWeight="650" letterSpacing="-0.6" textLength="82" lengthAdjust="spacingAndGlyphs">rentor</text>
      </>
    ),
  },
  "Real Capital Group": {
    width: 196,
    art: (
      <>
        <rect x="1" y="17" width="5" height="12" rx="1" fill="currentColor" />
        <rect x="9" y="10" width="5" height="19" rx="1" fill="currentColor" />
        <rect x="17" y="3" width="5" height="26" rx="1" fill="currentColor" />
        <text x="32" y="20" fontFamily={sans} fontSize="15" fontWeight="700" letterSpacing="1.5" textLength="128" lengthAdjust="spacingAndGlyphs">REAL CAPITAL</text>
        <text x="32" y="30" fontFamily={sans} fontSize="8" fontWeight="500" letterSpacing="3.2" textLength="52" lengthAdjust="spacingAndGlyphs">GROUP</text>
      </>
    ),
  },
  "Northgate Living": {
    width: 188,
    art: (
      <>
        <circle cx="14" cy="16" r="12.5" stroke="currentColor" strokeWidth="2.4" fill="none" />
        <path d="M8.5 24V15a5.5 5.5 0 0 1 11 0v9" stroke="currentColor" strokeWidth="2.4" fill="none" />
        <text x="35" y="23" fontFamily={sans} fontSize="20" fontWeight="700" letterSpacing="-0.5" textLength="92" lengthAdjust="spacingAndGlyphs">Northgate</text>
        <text x="132" y="23" fontFamily={sans} fontSize="20" fontWeight="300" letterSpacing="-0.4" textLength="54" lengthAdjust="spacingAndGlyphs">Living</text>
      </>
    ),
  },
  "Keystone Residential": {
    width: 172,
    art: (
      <>
        <path d="M3 4h24l-5 24H8L3 4Z" fill="currentColor" />
        <path d="M11 4l1.5 24M19 4l-1.5 24" stroke="var(--color-ink)" strokeWidth="1.6" />
        <text x="36" y="18" fontFamily={sans} fontSize="16" fontWeight="600" letterSpacing="2.4" textLength="132" lengthAdjust="spacingAndGlyphs">KEYSTONE</text>
        <text x="36" y="29" fontFamily={sans} fontSize="8" fontWeight="500" letterSpacing="2.6" textLength="94" lengthAdjust="spacingAndGlyphs">RESIDENTIAL</text>
      </>
    ),
  },
  "Harbor & Main": {
    width: 176,
    art: (
      <>
        <path d="M2 12c4-4 8-4 12 0s8 4 12 0M2 19c4-4 8-4 12 0s8 4 12 0M2 26c4-4 8-4 12 0s8 4 12 0" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <text x="36" y="24" fontFamily="Georgia, 'Times New Roman', serif" fontSize="22" fontStyle="italic" textLength="138" lengthAdjust="spacingAndGlyphs">Harbor &amp; Main</text>
      </>
    ),
  },
  "Oakline Properties": {
    width: 172,
    art: (
      <>
        <path d="M14 2C6 9 4 17 14 30 24 17 22 9 14 2Z" fill="currentColor" />
        <path d="M14 10v20" stroke="var(--color-ink)" strokeWidth="1.8" />
        <text x="34" y="23" fontFamily={sans} fontSize="21" fontWeight="500" letterSpacing="-0.6" textLength="76" lengthAdjust="spacingAndGlyphs">oakline</text>
        <text x="114" y="23" fontFamily={sans} fontSize="12" fontWeight="400" letterSpacing="0.6" textLength="56" lengthAdjust="spacingAndGlyphs">properties</text>
      </>
    ),
  },
};

export function PartnerLogo({ name }: { name: string }) {
  const mark = marks[name];
  if (!mark) {
    return <span className="text-2xl font-medium tracking-[-0.02em] whitespace-nowrap">{name}</span>;
  }
  return (
    <svg viewBox={`0 0 ${mark.width} 32`} height="32" width={mark.width} role="img" aria-label={name} fill="currentColor" className="shrink-0">
      {mark.art}
    </svg>
  );
}
