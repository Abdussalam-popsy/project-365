"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { navLinks } from "@/content/site";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { SiteLink } from "./SiteLink";
import { AgentsMenu } from "./nav/AgentsMenu";
import { MobileMenu } from "./nav/MobileMenu";

export function Nav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);

  const [lightHero, setLightHero] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 80));

  // A light hero would hide the white nav text, so the bar goes solid straight away.
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setLightHero(root.dataset.heroTone === "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-hero-tone"] });
    return () => observer.disconnect();
  }, []);
  const dark = solid || lightHero;

  return (
    <motion.header
      className="fixed inset-x-0 top-10 z-20 border-b transition-colors duration-300"
      animate={{
        backgroundColor: dark ? "rgba(30,15,38,0.92)" : "rgba(30,15,38,0)",
        borderColor: dark ? "rgba(201,181,218,0.12)" : "rgba(201,181,218,0.18)",
      }}
      style={{ backdropFilter: dark ? "blur(14px)" : "none" }}
    >
      <nav className="mx-auto grid h-16 max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center px-6 text-white">
        <div className="hidden items-center gap-8 text-[15px] md:flex">
          <SiteLink href={navLinks.platform.href} className="text-white/75 transition-colors hover:text-white">
            {navLinks.platform.label}
          </SiteLink>
          <AgentsMenu />
          <SiteLink href={navLinks.customers.href} className="text-white/75 transition-colors hover:text-white">
            {navLinks.customers.label}
          </SiteLink>
        </div>
        <SiteLink href="/" className="col-start-1 justify-self-start md:col-start-2 md:justify-self-center" aria-label="Haven home">
          <Logo />
        </SiteLink>
        <div className="col-start-3 flex items-center justify-end gap-2">
          {/* Hidden via a wrapper: a `hidden` class on Button itself loses to Button's own `inline-flex`. */}
          <span className="hidden sm:block">
            <Button className="h-10 px-5">Book a demo</Button>
          </span>
          <MobileMenu />
        </div>
      </nav>
    </motion.header>
  );
}
