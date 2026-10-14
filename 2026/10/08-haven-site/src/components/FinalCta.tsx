import { demoUrl } from "@/content/site";
import { Button } from "./Button";
import { SectionGlow } from "./SectionGlow";
import { PhoneIcon } from "./PhoneIcon";
import { Reveal } from "./Reveal";

interface FinalCtaProps {
  title?: string;
  body?: string;
  demoSource?: string;
  /** Where "Hear a call" jumps to; null hides it on pages without a call sample. */
  callHref?: string | null;
}

/** Closing call to action. Agent pages pass their own copy; the homepage uses the defaults. */
export function FinalCta({
  title = "Future-proof your property management business.",
  body = "Hand the repetitive work to Haven, and spend your time growing your portfolio.",
  demoSource,
  callHref = "#voice-demo",
}: FinalCtaProps) {
  return (
    <section id="book-a-demo" className="grain grain-fade-bottom relative overflow-hidden bg-night px-6 py-36 text-center text-white">
      {/* Plum and a touch of lilac, faded out before the footer starts. Adjust it with the Glow editor (dev tools) on any page. */}
      <SectionGlow id="closing" />
      <Reveal className="relative mx-auto max-w-[820px]">
        <h2 className="text-[44px] leading-[1.03] font-light tracking-[-0.035em] sm:text-[68px]">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-[520px] text-lg text-white/65">
          {body}
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button variant="light" href={demoUrl(demoSource)}>
            Book a demo
          </Button>
          {callHref && (
            <Button variant="outline" href={callHref}>
              <PhoneIcon className="mr-2" />
              Hear a call
            </Button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
