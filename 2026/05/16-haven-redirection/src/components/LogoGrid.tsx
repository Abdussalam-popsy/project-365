// Logo entries — swap src files in public/assets/logos/ to replace placeholders.
// All logo images should be SVG/PNG with transparent backgrounds.
// The `logo-item` class enforces standard height; width scales automatically.
const BASE = import.meta.env.BASE_URL;
const LOGOS: { name: string; src: string }[] = [
  { name: "Greystar", src: `${BASE}assets/logos/greystar.svg` },
  { name: "CBRE", src: `${BASE}assets/logos/cbre.svg` },
  { name: "JLL", src: `${BASE}assets/logos/jll.svg` },
  { name: "Colliers", src: `${BASE}assets/logos/colliers.svg` },
  { name: "Cushman & Wakefield", src: `${BASE}assets/logos/cushman.svg` },
  { name: "AvalonBay", src: `${BASE}assets/logos/avalonbay.svg` },
];

// Duplicated so the second copy fills the gap as the first scrolls out.
const TRACK = [...LOGOS, ...LOGOS];

export function LogoGrid() {
  return (
    <section className="bg-cream py-8">
      {/* Heading — inside container. Marquee below is full-width (intentional). */}
      <div className="mx-auto mb-10 w-full max-w-[1280px] px-5 sm:px-10 lg:px-20">
        <p className="text-center font-mono text-sm font-normal uppercase leading-[1.2] tracking-[0.14em] text-neutral-500">
          Used by top property management companies
        </p>
      </div>

      {/* Marquee — full-width overflow with cream gradient fade on edges */}
      <div className="group relative overflow-hidden">
        {/* Scrolling track — pauses on hover of the container */}
        {/*
          gap-16 on the container creates N-1 gaps for N items, so -50% never
          lands cleanly at the set boundary. Using mr-16 on each img instead
          means every item carries its own trailing space → -50% is exact.
        */}
        <div className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
          {TRACK.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.name}
              // logo-item: standard height, auto width, grayscale muted
              // Replace files in public/assets/logos/ — class stays the same
              className="logo-item mr-16 h-8 w-auto object-contain opacity-60 grayscale"
            />
          ))}
        </div>

        {/* Left fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-cream to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-cream to-transparent" />
      </div>
    </section>
  );
}
