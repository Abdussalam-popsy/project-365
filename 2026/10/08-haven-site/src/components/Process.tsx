import { process } from "@/content/site";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function Process() {
  return (
    <section className="bg-white px-6 pb-32">
      <div className="mx-auto max-w-[1140px] border-t border-ink/10 pt-24">
        <Reveal className="grid gap-6 md:grid-cols-2">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 text-[40px] leading-[1.05] font-light tracking-[-0.035em] sm:text-[52px]">
              Trained on your processes, live in weeks.
            </h2>
          </div>
        </Reveal>
        <ol className="mt-16 grid gap-10 md:grid-cols-4">
          {process.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.08}>
              <li className="border-t-2 border-violet pt-6">
                <span className="text-[13px] text-ink/45 tabular-nums">{p.step}</span>
                <h3 className="mt-3 text-[22px] tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/55">{p.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
