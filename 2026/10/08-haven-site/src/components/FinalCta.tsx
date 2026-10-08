import { Button } from "./Button";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section id="book-a-demo" className="grain relative overflow-hidden bg-plum-950 px-6 py-36 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_100%,rgba(87,64,239,0.55),transparent)]" />
      <Reveal className="relative mx-auto max-w-[820px]">
        <h2 className="text-[44px] leading-[1.03] font-light tracking-[-0.035em] sm:text-[68px]">
          Future-proof your property management business.
        </h2>
        <p className="mx-auto mt-6 max-w-[520px] text-lg text-white/65">
          Hand the repetitive work to Haven, and spend your time growing your portfolio.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button variant="light">Book a demo</Button>
          <Button variant="outline" href="#voice-demo">Hear a call</Button>
        </div>
      </Reveal>
    </section>
  );
}
