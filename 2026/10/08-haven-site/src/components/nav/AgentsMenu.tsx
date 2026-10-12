"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { agentPages } from "@/content/site";
import { SiteLink } from "../SiteLink";
import { Chevron } from "./icons";

const CLOSE_DELAY_MS = 140;
const ease = [0.16, 1, 0.3, 1] as const;

/** Desktop "Agents" dropdown: opens on hover or click, closes on Escape, outside click, or picking a page. */
export function AgentsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hovering opens the menu just before the click lands; that click shouldn't close it again.
  const openedByHover = useRef(false);
  const panelId = useId();

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  // A short delay lets the pointer cross the gap between the button and the panel.
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => cancelClose, []);

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelClose();
        if (!open) openedByHover.current = true;
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        openedByHover.current = false;
        closeSoon();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            return;
          }
          setOpen((o) => !o);
        }}
        className={`flex items-center gap-1.5 transition-colors hover:text-white ${open ? "text-white" : "text-white/75"}`}
      >
        Agents
        <Chevron className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          // pt-3 (not mt-3) so the hover area has no gap between button and panel.
          <motion.div
            id={panelId}
            className="absolute top-full -left-4 pt-3"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease }}
          >
            <ul className="w-[320px] rounded-2xl border border-lilac/15 bg-ink/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              {agentPages.map((page) => (
                <li key={page.id}>
                  <SiteLink
                    href={page.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                  >
                    <span className="block text-[15px] text-white">{page.label}</span>
                    <span className="mt-0.5 block text-[13px] text-white/55">{page.blurb}</span>
                  </SiteLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
