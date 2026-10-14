import { customerLogos, logoWidth } from "@/content/customerLogos";

/** Copies of the list per group, so one group is wider than very wide screens. */
const REPEAT = 2;

export function LogoMarquee() {
  const group = Array.from({ length: REPEAT }, () => customerLogos).flat();
  return (
    <section className="bg-night pt-24 pb-24 text-white sm:pt-32">
      <p className="mx-auto max-w-[760px] px-6 text-center text-[26px] leading-tight font-light tracking-[-0.02em] text-white/85 sm:text-[34px]">
        Trusted by leading property management companies.
      </p>
      <div className="mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        {/* Two identical groups, each with trailing padding equal to the gap, so -50% lands exactly on the seam. */}
        <div className="animate-marquee flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center gap-16 pr-16">
              {group.map((logo, i) => (
                <li key={i}>
                  {/* Logo files are white; opacity dims them to match the section's muted tone. */}
                  <img
                    src={logo.image.src}
                    alt={copy === 0 && i < customerLogos.length ? logo.name : ""}
                    height={logo.height}
                    width={logoWidth(logo)}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="block shrink-0 opacity-50 select-none"
                    style={{ height: logo.height, width: "auto" }}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
