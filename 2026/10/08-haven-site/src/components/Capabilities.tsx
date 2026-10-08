import { capabilities } from "@/content/site";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function Capabilities() {
  return (
    <section className="bg-mist px-6 py-32">
      <div className="mx-auto max-w-[1140px]">
        <Reveal className="max-w-[640px]">
          <Eyebrow>Why Haven</Eyebrow>
          <h2 className="mt-4 text-[40px] leading-[1.05] font-light tracking-[-0.035em] sm:text-[52px]">
            Digital workers that fit the way you already work.
          </h2>
        </Reveal>
        <div className="mt-16 grid border-t border-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 0.08}
              className="border-b border-ink/10 py-8 sm:pr-8 lg:border-r lg:border-b-0 lg:px-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="text-[13px] text-violet tabular-nums">0{i + 1}</span>
              <h3 className="mt-6 text-[22px] font-normal tracking-[-0.02em]">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/55">{c.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
