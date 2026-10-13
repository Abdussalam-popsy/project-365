import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { LogoMarquee } from "@/components/LogoMarquee";
import { HomeZoom } from "@/components/HomeZoom";
import { ProblemStatement } from "@/components/ProblemStatement";
import { Agents } from "@/components/Agents";
import { Channels } from "@/components/Channels";
import { VoiceDemo } from "@/components/VoiceDemo";
import { Testimonials } from "@/components/Testimonials";
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
        <Channels />
        <VoiceDemo />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
