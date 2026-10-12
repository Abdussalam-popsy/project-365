"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { agentPages, navLinks } from "@/content/site";
import { Button } from "../Button";
import { SiteLink } from "../SiteLink";
import { MenuIcon } from "./icons";

const ease = [0.16, 1, 0.3, 1] as const;

/** Below md: a menu button that drops a full-width panel with every nav destination. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const rowClass = "block rounded-xl px-4 py-3 text-[17px] text-white transition-colors hover:bg-white/[0.06]";

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="grid size-10 place-items-center rounded-full text-white/85 hover:text-white"
      >
        <MenuIcon open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            className="absolute inset-x-0 top-full px-3 pt-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease }}
          >
            <nav aria-label="Mobile" className="rounded-2xl border border-lilac/15 bg-ink/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <SiteLink href={navLinks.platform.href} onClick={close} className={rowClass}>
                {navLinks.platform.label}
              </SiteLink>
              <p className="px-4 pt-3 pb-1 text-[12px] font-medium tracking-[0.14em] text-lilac/70 uppercase">Agents</p>
              {agentPages.map((page) => (
                <SiteLink key={page.id} href={page.href} onClick={close} className={`${rowClass} pl-6`}>
                  {page.label}
                </SiteLink>
              ))}
              <SiteLink href={navLinks.customers.href} onClick={close} className={`${rowClass} mt-1`}>
                {navLinks.customers.label}
              </SiteLink>
              <div className="p-2 pt-3">
                <Button className="w-full rounded-xl">Book a demo</Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
