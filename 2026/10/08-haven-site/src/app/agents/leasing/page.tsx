import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Nav } from "@/components/Nav";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { AgentHero } from "@/components/agent-page/AgentHero";
import { ChatThread } from "@/components/agent-page/ChatThread";
import { DecisionCard } from "@/components/agent-page/DecisionCard";
import { LaneSplit } from "@/components/agent-page/LaneSplit";
import { SystemsList } from "@/components/agent-page/FaqList";
import { FeatureGrid, Section, SectionIntro, StageGrid } from "@/components/agent-page/sections";
import { Chip, HeroPanel } from "@/components/agent-page/ui";
import {
  leasingBeats as beats, leasingCta as cta, leasingFeatures as features, leasingHero as hero,
  leasingMeta as meta, leasingStops as stops, leasingThread as thread, leasingWhy as why,
} from "@/content/agents/leasing";
import { systemsOfRecord as systems } from "@/content/agents/shared";

export const metadata: Metadata = { title: meta.title, description: meta.description };

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
            <HeroPanel className="flex flex-col gap-5">
              <ChatThread messages={thread.messages} />
              <div className="flex flex-wrap gap-2">
                {thread.status.map((chip) => (
                  <Chip key={chip.label} chip={chip} />
                ))}
              </div>
              <DecisionCard decision={thread.decision} />
            </HeroPanel>
          }
        />

        <Section>
          <SectionIntro eyebrow={why.eyebrow} title={why.title} body={why.body} centered />
        </Section>

        <Section surface="white">
          <SectionIntro eyebrow={features.eyebrow} title={features.title} />
          <FeatureGrid items={features.items} />
        </Section>

        <Section id="how-it-works">
          <SectionIntro title={beats.title} />
          <StageGrid stages={beats.items} />
        </Section>

        <Section surface="white">
          <SectionIntro eyebrow={stops.eyebrow} title={stops.title} body={stops.body} />
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
