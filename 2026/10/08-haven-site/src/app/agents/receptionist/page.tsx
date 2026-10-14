import { agentMetadata } from "@/lib/agentMetadata";
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
import { FeatureGrid, Section, SectionIntro, Split } from "@/components/agent-page/sections";
import { StageStepper } from "@/components/agent-page/motion/StageStepper";
import {
  receptionistAlways as always, receptionistBeats as beats, receptionistCall as call, receptionistCallLog as callLog,
  receptionistCta as cta, receptionistFeatures as features, receptionistHero as hero, receptionistMeta as meta,
  receptionistStops as stops,
} from "@/content/agents/receptionist";
import { systemsOfRecord as systems } from "@/content/agents/shared";

// Unlisted for now (see `agentPages` in content/site.ts): live at its URL, hidden from the nav and search.
export const generateMetadata = agentMetadata({ ...meta, noindex: true });

export default function ReceptionistPage() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <AgentHero {...hero} demoSource={meta.demoSource} visual={<CallLog entries={callLog} />} />

        <Section>
          <SectionIntro title={always.title} body={always.body} centered />
        </Section>

        <Section surface="white">
          <SectionIntro title={features.title} />
          <FeatureGrid items={features.items} />
        </Section>

        <Section id="voice-demo" surface="ink">
          <Split
            text={<SectionIntro title={call.title} body={call.body} dark />}
            visual={<CallTranscript sample={call.sample} />}
          />
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

        <FinalCta title={cta.title} body={cta.body} demoSource={meta.demoSource} />
      </main>
      <Footer />
    </>
  );
}
