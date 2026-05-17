// Logo entries — swap src files in public/assets/logos/ to replace placeholders.
// All logo images should be SVG/PNG with transparent backgrounds.
// The `logo-item` class enforces standard height; width scales automatically.
const LOGOS: { name: string; src: string }[] = [
  { name: "Greystar", src: "/assets/logos/greystar.svg" },
  { name: "CBRE", src: "/assets/logos/cbre.svg" },
  { name: "JLL", src: "/assets/logos/jll.svg" },
  { name: "Colliers", src: "/assets/logos/colliers.svg" },
  { name: "Cushman & Wakefield", src: "/assets/logos/cushman.svg" },
  { name: "AvalonBay", src: "/assets/logos/avalonbay.svg" },
];

// Duplicated so the second copy fills the gap as the first scrolls out.
const TRACK = [...LOGOS, ...LOGOS];

export function LogoGrid() {
  return (
    <section className="bg-cream py-14">
      {/* Heading */}
      <p className="mx-auto mb-10 max-w-[1280px] px-20 text-center font-mono text-sm font-normal uppercase leading-[1.2] tracking-[0.14em] text-neutral-500">
        Used by top property management companies
      </p>

      {/* Marquee — full-width overflow with cream gradient fade on edges */}
      <div className="group relative overflow-hidden">
        {/* Scrolling track — pauses on hover of the container */}
        <div className="animate-marquee flex w-max items-center gap-16 px-16 group-hover:[animation-play-state:paused]">
          {TRACK.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.name}
              // logo-item: standard height, auto width, grayscale muted
              // Replace files in public/assets/logos/ — class stays the same
              className="logo-item h-8 w-auto object-contain opacity-60 grayscale"
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
