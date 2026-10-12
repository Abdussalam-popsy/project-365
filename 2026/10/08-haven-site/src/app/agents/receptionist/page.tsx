import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Nav } from "@/components/Nav";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { AgentHero } from "@/components/agent-page/AgentHero";
import { CallLog } from "@/components/agent-page/CallLog";
import { CallTranscript } from "@/components/agent-page/CallTranscript";
import { LaneSplit } from "@/components/agent-page/LaneSplit";
import { SystemsList } from "@/components/agent-page/FaqList";
import { FeatureGrid, Section, SectionIntro, Split, StageGrid } from "@/components/agent-page/sections";
import {
  receptionistAlways as always, receptionistBeats as beats, receptionistCall as call, receptionistCallLog as callLog,
  receptionistCta as cta, receptionistFeatures as features, receptionistHero as hero, receptionistMeta as meta,
  receptionistStops as stops,
} from "@/content/agents/receptionist";
import { systemsOfRecord as systems } from "@/content/agents/shared";

export const metadata: Metadata = { title: meta.title, description: meta.description };

export default function ReceptionistPage() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <AgentHero {...hero} demoSubject={meta.demoSubject} visual={<CallLog entries={callLog} />} />

        <Section>
          <SectionIntro eyebrow={always.eyebrow} title={always.title} body={always.body} centered />
        </Section>

        <Section surface="white">
          <SectionIntro eyebrow={features.eyebrow} title={features.title} />
          <FeatureGrid items={features.items} />
        </Section>

        <Section id="voice-demo" surface="ink">
          <Split
            text={<SectionIntro eyebrow={call.eyebrow} title={call.title} body={call.body} dark />}
            visual={<CallTranscript sample={call.sample} />}
          />
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

        <FinalCta title={cta.title} body={cta.body} demoSubject={meta.demoSubject} />
      </main>
      <Footer />
    </>
  );
}
