"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { navLinks } from "@/content/site";
import { Logo } from "./Logo";
import { Button } from "./Button";

export function Nav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 80));

  return (
    <motion.header
      className="fixed inset-x-0 top-10 z-20 border-b transition-colors duration-300"
      animate={{
        backgroundColor: solid ? "rgba(30,15,38,0.92)" : "rgba(30,15,38,0)",
        borderColor: solid ? "rgba(201,181,218,0.12)" : "rgba(201,181,218,0.18)",
      }}
      style={{ backdropFilter: solid ? "blur(14px)" : "none" }}
    >
      <nav className="mx-auto grid h-16 max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center px-6 text-white">
        <div className="hidden items-center gap-8 text-[15px] md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-white/75 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>
        <a href="#" className="col-start-1 md:col-start-2" aria-label="Haven home">
          <Logo />
        </a>
        <div className="col-start-3 flex items-center justify-end gap-3">
          <a href="#" className="hidden text-[15px] text-white/75 hover:text-white sm:inline">
            Log in
          </a>
          <Button className="h-10 px-5">Book a demo</Button>
        </div>
      </nav>
    </motion.header>
  );
}
