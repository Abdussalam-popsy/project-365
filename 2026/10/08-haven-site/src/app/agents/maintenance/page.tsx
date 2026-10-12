import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Nav } from "@/components/Nav";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { AgentHero } from "@/components/agent-page/AgentHero";
import { LifecycleVisual } from "@/components/agent-page/LifecycleVisual";
import { FeatureGrid, Section, SectionIntro, Split, StageGrid } from "@/components/agent-page/sections";
import { ChatThread, WorkOrderCard } from "@/components/agent-page/ChatThread";
import { DispatchLogMotion } from "@/components/agent-page/motion/DispatchLogMotion";
import { ScheduleThreadMotion } from "@/components/agent-page/motion/ScheduleThreadMotion";
import { CallTranscript } from "@/components/agent-page/CallTranscript";
import { HumanLine } from "@/components/agent-page/HumanLine";
import { FaqList, SystemsList } from "@/components/agent-page/FaqList";
import { EstimateMock } from "@/components/agent-page/maintenance/EstimateMock";
import { MockPanel } from "@/components/agent-page/ui";
import {
  maintenanceApprovals as approvals, maintenanceCall as call, maintenanceCta as cta, maintenanceDispatch as dispatch,
  maintenanceFaq as faq, maintenanceHero as hero, maintenanceHumanLine as humanLine, maintenanceLifecycle as lifecycle,
  maintenanceMeta as meta, maintenanceStages as stages, maintenanceSystems as systems, maintenanceTriage as triage,
} from "@/content/agents/maintenance";

export const metadata: Metadata = { title: meta.title, description: meta.description };

export default function MaintenancePage() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <AgentHero {...hero} demoSubject={meta.demoSubject} visual={<LifecycleVisual steps={lifecycle} />} />

        <Section id="lifecycle">
          <SectionIntro title={stages.title} body={stages.body} />
          <StageGrid stages={stages.items} />
        </Section>

        <Section surface="white">
          <Split
            text={<SectionIntro title={triage.title} body={triage.body} />}
            visual={
              <MockPanel className="flex flex-col gap-6">
                <ChatThread messages={triage.chat} />
                <WorkOrderCard order={triage.workOrder} />
              </MockPanel>
            }
          />
          <FeatureGrid items={triage.features} />
        </Section>

        <Section>
          <SectionIntro title={dispatch.title} body={dispatch.body} />
          <div className="mt-14 flex flex-col gap-16">
            <Split
              flip
              text={<BlockText {...dispatch.blocks[0]} />}
              visual={<DispatchLogMotion heading={dispatch.log.heading} title={dispatch.log.vendor} date={dispatch.log.date} events={dispatch.log.events} />}
            />
            <Split
              text={<BlockText {...dispatch.blocks[1]} />}
              visual={<ScheduleThreadMotion messages={dispatch.thread} order={dispatch.threadOrder} />}
            />
          </div>
        </Section>

        <Section surface="white">
          <Split
            text={
              <>
                <SectionIntro title={approvals.title} body={approvals.body} />
                <ul className="mt-10 flex flex-col">
                  {approvals.cards.map((card) => (
                    <li key={card.title} className="border-t border-ink/10 py-5">
                      <h3 className="text-[17px] font-medium">{card.title}</h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-ink/55">{card.body}</p>
                    </li>
                  ))}
                </ul>
              </>
            }
            visual={<EstimateMock estimate={approvals.estimate} />}
          />
        </Section>

        <Section id="voice-demo" surface="ink">
          <Split
            text={<SectionIntro title={call.title} body={call.body} dark />}
            visual={<CallTranscript sample={call.sample} />}
          />
        </Section>

        <Section>
          <SectionIntro title={humanLine.title} body={humanLine.body} centered />
          <HumanLine agent={humanLine.agent} you={humanLine.you} footnote={humanLine.footnote} />
        </Section>

        <Section surface="white">
          <SectionIntro title={systems.title} body={systems.body} centered />
          <Reveal delay={0.1}>
            <SystemsList live={systems.live} next={systems.next} />
          </Reveal>
        </Section>

        <Section id="faq">
          <SectionIntro title="Questions, answered." centered />
          <FaqList items={faq} />
        </Section>

        <FinalCta night title={cta.title} body={cta.body} demoSubject={meta.demoSubject} />
      </main>
      <Footer night />
    </>
  );
}

function BlockText({ title, body }: { title: string; body: string }) {
  return (
    <Reveal>
      <h3 className="text-[26px] leading-[1.15] font-light tracking-[-0.02em] sm:text-[30px]">{title}</h3>
      <p className="mt-4 text-[17px] leading-relaxed text-ink/60">{body}</p>
    </Reveal>
  );
}
