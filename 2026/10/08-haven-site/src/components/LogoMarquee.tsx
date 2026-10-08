import { customers } from "@/content/site";
import { PartnerLogo } from "./PartnerLogos";

/** Copies of the list per group, so one group is wider than very wide screens. */
const REPEAT = 2;

export function LogoMarquee() {
  const group = Array.from({ length: REPEAT }, () => customers).flat();
  return (
    <section className="bg-ink pt-24 pb-24 text-white sm:pt-32">
      <p className="mx-auto max-w-[760px] px-6 text-center text-[26px] leading-tight font-light tracking-[-0.02em] text-white/85 sm:text-[34px]">
        Trusted by leading property management companies.
      </p>
      <div className="mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        {/* Two identical groups, each with trailing padding equal to the gap, so -50% lands exactly on the seam. */}
        <div className="animate-marquee flex w-max text-white/50">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center gap-16 pr-16">
              {group.map((name, i) => (
                <li key={i}>
                  <PartnerLogo name={name} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
