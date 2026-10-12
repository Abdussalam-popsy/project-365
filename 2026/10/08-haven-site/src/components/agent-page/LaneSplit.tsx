import type { Lanes } from "@/content/agents/types";
import { Reveal } from "../Reveal";

function LaneGroup({ title, items, human }: { title: string; items: string[]; human: boolean }) {
  return (
    <div className={`rounded-[28px] p-7 sm:p-9 ${human ? "bg-ink text-white" : "border border-ink/[0.07] bg-white"}`}>
      <p className={`text-[13px] font-medium tracking-[0.14em] uppercase ${human ? "text-lilac" : "text-violet"}`}>{title}</p>
      <ul className="mt-6 flex flex-wrap gap-2.5">
        {items.map((item) => (
          <li
            key={item}
            className={`rounded-full px-4 py-2 text-[15px] ${human ? "border border-white/15 text-white" : "bg-tray text-ink"}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The kinds of work the agent runs on one side, the ones a person keeps on the other, plus an optional note. */
export function LaneSplit({ lanes }: { lanes: Lanes }) {
  return (
    <Reveal delay={0.1} className="mt-14">
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <LaneGroup title={lanes.agentTitle} items={lanes.agent} human={false} />
        <LaneGroup title={lanes.youTitle} items={lanes.you} human />
      </div>
      {lanes.note && (
        <div className="mt-5 rounded-[28px] bg-tray p-7 sm:p-9">
          <h3 className="text-[17px] font-medium">{lanes.note.title}</h3>
          <p className="mt-2 max-w-[760px] text-[16px] leading-relaxed text-ink/60">{lanes.note.body}</p>
        </div>
      )}
    </Reveal>
  );
}
