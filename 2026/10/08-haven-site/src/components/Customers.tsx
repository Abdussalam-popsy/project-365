import { customersCta, customersIntro } from "@/content/customers";
import { customerLogos, logoWidth } from "@/content/customerLogos";
import { Button } from "./Button";
import { SectionIntro } from "./SectionHeading";
import { Reveal } from "./Reveal";

/**
 * Customers: every firm on Haven as a logo wall, then the demo CTA.
 * The logo files are white (they also feed the dark hero marquee), so `brightness-0` inks them for this light section.
 * The gradient case-study cards are parked in CustomerStories.tsx for when there are real stories to tell.
 */
export function Customers() {
  return (
    <section id="customers" className="scroll-mt-28 bg-page py-32">
      <div className="mx-auto max-w-[1140px] px-6 xl:px-0">
        <SectionIntro eyebrow={customersIntro.eyebrow} title={customersIntro.title} body={customersIntro.body} />

        <Reveal delay={0.15}>
          {/* 1px gaps over a tinted backdrop draw the hairlines between cells. */}
          <ul className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-ink/10 bg-ink/10 sm:grid-cols-3 lg:grid-cols-4">
            {customerLogos.map((logo) => (
              <li key={logo.name} className="group grid h-[120px] place-items-center bg-page px-6 sm:h-[150px]">
                <img
                  src={logo.image.src}
                  alt={logo.name}
                  height={logo.height}
                  width={logoWidth(logo)}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="max-w-full object-contain opacity-55 brightness-0 transition-opacity duration-300 select-none group-hover:opacity-90"
                  style={{ height: logo.height, width: "auto" }}
                />
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button>Book a demo</Button>
          <p className="text-[16px] text-ink/55">{customersCta.line}</p>
        </div>
      </div>
    </section>
  );
}
