import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { LogoGrid } from "./components/LogoGrid";
import { BentoSection } from "./components/BentoSection";
import { AgentsSection } from "./components/AgentsSection";
import { MicroTools } from "./micro-tools/MicroTools";

export default function App() {
  return (
    <div className="bg-cream">
      <Navbar />
      <Hero />
      <LogoGrid />
      <BentoSection />
      <AgentsSection />
      {import.meta.env.DEV && <MicroTools />}
    </div>
  );
}
