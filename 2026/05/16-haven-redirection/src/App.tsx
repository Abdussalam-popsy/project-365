import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { LogoGrid } from "./components/LogoGrid";

export default function App() {
  return (
    <div className="bg-cream">
      <Navbar />
      <Hero />
      <LogoGrid />
    </div>
  );
}
