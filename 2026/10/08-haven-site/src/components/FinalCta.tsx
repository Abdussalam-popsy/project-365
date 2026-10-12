import { demoUrl } from "@/content/site";
import { Button } from "./Button";
import { PhoneIcon } from "./PhoneIcon";
import { Reveal } from "./Reveal";

interface FinalCtaProps {
  title?: string;
  body?: string;
  demoSubject?: string;
}

/** Closing call to action. Agent pages pass their own copy; the homepage uses the defaults. */
export function FinalCta({
  title = "Future-proof your property management business.",
  body = "Hand the repetitive work to Haven, and spend your time growing your portfolio.",
  demoSubject,
}: FinalCtaProps) {
  return (
    <section id="book-a-demo" className="grain relative overflow-hidden bg-ink px-6 py-36 text-center text-white">
      {/* Plum and a touch of lilac, centred above the bottom edge so it has faded out before the footer (also ink) starts. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_55%,rgba(67,35,79,0.95),transparent),radial-gradient(35%_30%_at_50%_60%,rgba(201,181,218,0.10),transparent)]" />
      <Reveal className="relative mx-auto max-w-[820px]">
        <h2 className="text-[44px] leading-[1.03] font-light tracking-[-0.035em] sm:text-[68px]">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-[520px] text-lg text-white/65">
          {body}
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button variant="light" href={demoUrl(demoSubject)}>
            Book a demo
          </Button>
          <Button variant="outline" href="#voice-demo">
            <PhoneIcon className="mr-2" />
            Hear a call
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
