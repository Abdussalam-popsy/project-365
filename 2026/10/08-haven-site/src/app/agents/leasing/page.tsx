import { agentMetadata } from "@/lib/agentMetadata";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Nav } from "@/components/Nav";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { AgentHero } from "@/components/agent-page/AgentHero";
import { LoopingChat } from "@/components/agent-page/motion/LoopingChat";
import { DecisionCard } from "@/components/agent-page/DecisionCard";
import { LaneSplit } from "@/components/agent-page/LaneSplit";
import { SystemsList } from "@/components/agent-page/FaqList";
import { FeatureGrid, Section, SectionIntro } from "@/components/agent-page/sections";
import { StageStepper } from "@/components/agent-page/motion/StageStepper";
import { Chip, HeroPanel } from "@/components/agent-page/ui";
import {
  leasingBeats as beats, leasingCta as cta, leasingFeatures as features, leasingHero as hero,
  leasingMeta as meta, leasingStops as stops, leasingThread as thread, leasingWhy as why,
} from "@/content/agents/leasing";
import { systemsOfRecord as systems } from "@/content/agents/shared";

export const generateMetadata = agentMetadata(meta);

export default function LeasingPage() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <AgentHero
          {...hero}
          demoSubject={meta.demoSubject}
          visual={
            <HeroPanel>
              <LoopingChat
                messages={thread.messages}
                after={[
                  <div key="status" className="flex flex-wrap gap-2">
                    {thread.status.map((chip) => (
                      <Chip key={chip.label} chip={chip} />
                    ))}
                  </div>,
                  <DecisionCard key="decision" decision={thread.decision} />,
                ]}
              />
            </HeroPanel>
          }
        />

        <Section>
          <SectionIntro title={why.title} body={why.body} centered />
        </Section>

        <Section surface="white">
          <SectionIntro title={features.title} />
          <FeatureGrid items={features.items} />
        </Section>

        <Section id="how-it-works">
          <SectionIntro title={beats.title} />
          <StageStepper stages={beats.items} visuals={beats.visuals} recordTitle={beats.record.title} recordDate={beats.record.date} stepLabel="Beat" />
        </Section>

        <Section surface="white">
          <SectionIntro title={stops.title} body={stops.body} />
          <LaneSplit lanes={stops.lanes} />
        </Section>

        <Section>
          <SectionIntro title={systems.title} body={systems.body} centered />
          <Reveal delay={0.1}>
            <SystemsList live={systems.live} next={systems.next} />
          </Reveal>
        </Section>

        <FinalCta night title={cta.title} body={cta.body} demoSubject={meta.demoSubject} callHref={null} />
      </main>
      <Footer night />
    </>
  );
}
