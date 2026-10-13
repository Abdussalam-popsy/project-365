import { agents } from "@/content/site";
import { Button } from "./Button";
import { Eyebrow, SectionIntro } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { MaintenanceMock, LeasingMock, ComingSoonMock } from "./AgentMocks";

const mocks = {
  maintenance: MaintenanceMock,
  leasing: LeasingMock,
  "coming-soon": ComingSoonMock,
};

export function Agents() {
  // overflow-x-clip: a safety net so nothing in the mocks can make the page scroll sideways on phones.
  return (
    <section id="agents" className="overflow-x-clip bg-page px-6 pb-32">
      <SectionIntro title="Agents that work while you sleep." body="Every request answered. Every lead followed up. No resident left waiting." align="center" />

      <div className="mx-auto mt-28 flex max-w-[1140px] flex-col gap-20 md:gap-32">
        {agents.map((agent, i) => {
          const Mock = mocks[agent.id];
          const [textCol, mockCol] = i % 2 ? ["md:col-start-2", "md:col-start-1"] : ["md:col-start-1", "md:col-start-2"];
          return (
            // Phones read heading → mock → details, so the mock sits with the words it illustrates.
            // From md up the text keeps one column beside the mock, as before.
            <article
              key={agent.id}
              className="grid items-center gap-y-8 border-t border-ink/10 pt-16 md:grid-cols-2 md:gap-x-20 md:gap-y-0"
            >
              <Reveal className={`md:row-start-1 md:self-end ${textCol}`}>
                <Eyebrow>{agent.eyebrow}</Eyebrow>
                <h3 className="mt-4 text-[34px] leading-[1.08] font-light tracking-[-0.03em] sm:text-[44px]">
                  {agent.title}
                </h3>
                <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-ink/55">{agent.body}</p>
              </Reveal>
              <Reveal delay={0.15} className={`mock-compact md:row-span-2 md:row-start-1 ${mockCol}`}>
                <Mock />
              </Reveal>
              <Reveal className={`md:row-start-2 md:self-start ${textCol}`}>
                <ul className="grid max-w-[480px] grid-cols-2 gap-x-6 gap-y-3 text-[15px] md:mt-8">
                  {agent.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5">
                      <span className="size-1.5 rounded-full bg-heather" />
                      {p}
                    </li>
                  ))}
                </ul>
                {"link" in agent && (
                  <Button href={agent.link.href} variant="outline" className="mt-10">
                    {agent.link.label} <span aria-hidden className="ml-2">→</span>
                  </Button>
                )}
              </Reveal>
            </article>
          );
        })}
      </div>
    </section>
  );
}
