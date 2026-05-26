import { HavenLogoGrid } from "./footer/HavenLogoGrid";

// ─── Nav link columns ─────────────────────────────────────────────────────────
const NAV_COLS = [
  ["Home", "About", "Research"],
  ["Frontline", "Maintenance", "Leasing"],
  ["LinkedIn", "Twitter"],
];

// ─── Footer ───────────────────────────────────────────────────────────────────
export function FooterSection() {
  return (
    <footer
      className="w-full bg-cream px-5 pb-8 pt-[72px] sm:px-10 lg:px-20"
      style={{ overflowX: "clip", overflowY: "visible" }}
    >
      <div className="mx-auto w-full max-w-[1280px]">

        {/* ── Top row: headline + CTA | nav ── */}
        <div className="flex flex-col gap-10 pb-10 lg:flex-row lg:items-start lg:justify-between">

          {/* Left: headline + CTA */}
          <div className="flex flex-col gap-6">
            <h2 className="max-w-[480px] text-[32px] font-semibold leading-[1.2] tracking-[-0.05em] text-[#071219] lg:text-[40px]">
              Stop losing time to work your agents can handle.
            </h2>
            <button className="w-fit rounded-[6px] bg-neutral-900 px-4 py-2 text-base font-semibold leading-[1.5] text-white transition-opacity hover:opacity-80">
              Book a demo
            </button>
          </div>

          {/* Right: nav columns */}
          <div className="flex gap-10 text-base leading-[1.3] tracking-[-0.04em] text-black sm:gap-16">
            {NAV_COLS.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-3">
                {col.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="transition-opacity hover:opacity-50"
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Wordmark canvas ── */}
        <HavenLogoGrid />

        {/* ── Bottom bar ── */}
        <div className="mt-6 flex flex-col gap-3 text-base leading-[1.3] tracking-[-0.04em] text-black sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <span>Copyright 2026 © Haven.</span>
            <span className="text-black/40">Designed by Popsy</span>
          </div>
          <div className="flex gap-4 text-black/60">
            {["Contact", "Privacy", "Terms"].map((item) => (
              <a key={item} href="#" className="transition-opacity hover:opacity-70">
                {item}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
