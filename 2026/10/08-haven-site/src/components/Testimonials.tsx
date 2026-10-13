import { testimonials } from "@/content/site";
import { Chip } from "./agent-page/ui";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

const agentTone = { Maintenance: "violet", Leasing: "green" } as const;

/** What customers say: rounded white cards in the site's mock style, each tagged with the agents that firm runs. */
export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-28 bg-page px-6 pt-8 pb-32">
      <div className="mx-auto max-w-[1140px]">
        <Reveal className="text-center">
          <Eyebrow>What our customers say</Eyebrow>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} className="h-full">
              <figure className="flex h-full flex-col justify-between rounded-[28px] border border-ink/[0.06] bg-white p-8 shadow-[0_18px_40px_-24px_rgba(30,15,38,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 sm:p-10">
                <blockquote className="text-[22px] leading-[1.32] font-light tracking-[-0.02em] sm:text-[26px]">
                  <span aria-hidden className="mb-2 block font-serif text-[56px] leading-[0.6] text-orchid">
                    “
                  </span>
                  {t.quote}
                </blockquote>
                <figcaption className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-4">
                  <span className="grid size-11 place-items-center rounded-full bg-bubble text-[13px] font-medium text-heather">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <span className="mr-auto">
                    <span className="block text-[15px] font-medium">{t.name}</span>
                    <span className="block text-[13px] text-ink/50">{t.role}</span>
                  </span>
                  <span className="flex gap-1.5">
                    {t.agents.map((agent) => (
                      <Chip key={agent} chip={{ label: agent, tone: agentTone[agent as keyof typeof agentTone] }} />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
