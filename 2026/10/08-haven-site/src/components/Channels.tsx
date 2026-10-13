"use client";

import { AnimatePresence, motion } from "motion/react";
import { channels, channelsIntro } from "@/content/channels";
import { AutoStepper } from "./agent-page/motion/AutoStepper";
import { MockPanel } from "./agent-page/ui";
import { channelIcons, channelMocks } from "./channels/ChannelVisuals";
import { SectionIntro } from "./SectionHeading";

const ease = [0.16, 1, 0.3, 1] as const;
const CHANNEL_MS = 6500;

/** Where Haven works: text, email, phone and the PMS, as one maintenance case seen through each. */
export function Channels() {
  return (
    <section id="platform" className="scroll-mt-28 bg-page px-6 pb-32">
      <div className="mx-auto max-w-[1140px] border-t border-ink/10 pt-24">
        <SectionIntro eyebrow={channelsIntro.eyebrow} title={channelsIntro.title} body={channelsIntro.body} />

        <AutoStepper
          items={channels}
          stepMs={CHANNEL_MS}
          showTimer
          marker={(i, open) => (
            <span
              className={`grid size-[26px] shrink-0 place-items-center rounded-lg transition-colors ${open ? "bg-heather text-white" : "bg-tray text-ink/40"}`}
            >
              {channelIcons[channels[i].id]}
            </span>
          )}
          renderVisual={(active) => {
            const Mock = channelMocks[channels[active].id];
            return (
              <MockPanel className="mock-compact min-h-[430px] pb-[72px] sm:pb-[76px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <Mock />
                  </motion.div>
                </AnimatePresence>
              </MockPanel>
            );
          }}
        />
      </div>
    </section>
  );
}
