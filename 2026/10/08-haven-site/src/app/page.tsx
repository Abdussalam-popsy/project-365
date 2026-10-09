import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { LogoMarquee } from "@/components/LogoMarquee";
import { HomeZoom } from "@/components/HomeZoom";
import { ProblemStatement } from "@/components/ProblemStatement";
import { Agents } from "@/components/Agents";
import { VoiceDemo } from "@/components/VoiceDemo";
import { Capabilities } from "@/components/Capabilities";
import { Testimonials } from "@/components/Testimonials";
import { Process } from "@/components/Process";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero />
        <LogoMarquee />
        <HomeZoom />
        <ProblemStatement />
        <Agents />
        <VoiceDemo />
        <Capabilities />
        <Testimonials />
        <Process />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
