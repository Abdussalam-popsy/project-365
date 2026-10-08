import { testimonials } from "@/content/site";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-white px-6 py-32">
      <div className="mx-auto max-w-[1140px]">
        <Reveal className="text-center">
          <Eyebrow>What our customers say</Eyebrow>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} className="flex flex-col justify-between border border-ink/10 bg-mist p-10">
              <p className="text-[24px] leading-[1.3] font-light tracking-[-0.02em] sm:text-[28px]">“{t.quote}”</p>
              <div className="mt-10 flex items-center gap-3">
                <span className="grid size-10 place-items-center bg-plum-900 text-[13px] font-medium text-lilac">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <p className="text-[15px] font-medium">{t.name}</p>
                  <p className="text-[13px] text-ink/50">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
