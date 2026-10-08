import { agents } from "@/content/site";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { MaintenanceMock, LeasingMock, ComingSoonMock } from "./AgentMocks";

const mocks = {
  maintenance: MaintenanceMock,
  leasing: LeasingMock,
  "coming-soon": ComingSoonMock,
};

export function Agents() {
  return (
    <section id="agents" className="bg-mist px-6 pb-32">
      <Reveal className="mx-auto max-w-[720px] text-center">
        <h2 className="text-[40px] leading-[1.05] font-light tracking-[-0.035em] sm:text-[56px]">
          Agents that work while you sleep.
        </h2>
        <p className="mt-5 text-lg text-ink/55 sm:text-xl">
          Every request answered. Every lead followed up. No resident left waiting.
        </p>
      </Reveal>

      <div className="mx-auto mt-28 flex max-w-[1140px] flex-col gap-32">
        {agents.map((agent, i) => {
          const Mock = mocks[agent.id];
          return (
            <article
              key={agent.id}
              className="grid items-center gap-12 border-t border-ink/10 pt-16 md:grid-cols-2 md:gap-20"
            >
              <Reveal className={i % 2 ? "md:order-2" : ""}>
                <Eyebrow>{agent.eyebrow}</Eyebrow>
                <h3 className="mt-4 text-[34px] leading-[1.08] font-light tracking-[-0.03em] sm:text-[44px]">
                  {agent.title}
                </h3>
                <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-ink/55">{agent.body}</p>
                <ul className="mt-8 grid max-w-[480px] grid-cols-2 gap-x-6 gap-y-3 text-[15px]">
                  {agent.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5">
                      <span className="size-1.5 bg-violet" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.15} className={i % 2 ? "md:order-1" : ""}>
                <Mock />
              </Reveal>
            </article>
          );
        })}
      </div>
    </section>
  );
}
