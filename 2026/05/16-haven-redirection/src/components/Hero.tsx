import { TileGrid } from "./TileGrid";

export function Hero() {
  return (
    <section className="relative min-h-dvh bg-cream px-5 pt-[65px] sm:px-10 lg:px-20">
      {/* Container — caps content at 1280px; TileGrid intentionally sits outside */}
      <div className="mx-auto w-full max-w-[1280px]">
        {/* Text content */}
        <div className="flex flex-col items-center pt-14 text-center sm:pt-20 lg:pt-24">
          {/* Eyebrow tag */}
          <div className="mb-7 inline-flex items-center">
            <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-neutral-800">
              Automate your property business
            </span>
          </div>

          {/* Headline */}
          <h1 className="mx-auto mb-6 w-full max-w-[800px] text-balance text-[2.5rem] font-medium leading-[1.06] tracking-[-0.025em] text-neutral-900 sm:text-6xl lg:text-7xl">
            AI agents that run your property operations
          </h1>

          {/* Subtext */}
          <p className="mb-10 max-w-[600px] text-base leading-relaxed text-neutral-500 text-balance">
            Haven handles inbound calls, maintenance coordination, and leasing
            follow-up. Your team stays in control. Your PMS stays up to date.
          </p>

          {/* CTA */}
          <button className="rounded-[8px] bg-neutral-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700">
            Book a demo
          </button>
        </div>
      </div>
      {/* end container */}

      {/* Tile grid — full-width, negative margins cancel the section's padding */}
      <div className="-mx-5 mt-14 sm:-mx-10 sm:mt-20 lg:-mx-20">
        <TileGrid />
      </div>
    </section>
  );
}
