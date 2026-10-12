import type { ChipTone, LogEvent } from "@/content/agents/types";
import { DateChip, MockCard } from "./ui";

const dotTones: Record<ChipTone, string> = {
  red: "bg-[#c9707d]",
  amber: "bg-[#c99a4b]",
  green: "bg-[#6aa07c]",
  violet: "bg-violet",
  neutral: "bg-ink/25",
};

interface EventLogProps {
  heading: string;
  title: string;
  date: string;
  events: LogEvent[];
}

/** A vertical, timestamped log: what happened, in order, as it lands on the work order. */
export function EventLog({ heading, title, date, events }: EventLogProps) {
  return (
    <MockCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink/[0.06] px-5 py-3.5">
        <span className="text-[13px] text-ink/45">{heading}</span>
        <DateChip date={date} />
      </div>
      <div className="px-5 pt-4 pb-5">
        <p className="text-[16px] text-ink">{title}</p>
        <ol className="relative mt-4 flex flex-col gap-3 border-l border-ink/10 pl-5">
          {events.map((event) => (
            <li key={event.text} className="relative flex items-baseline justify-between gap-4 text-[14px]">
              <span className={`absolute top-[7px] -left-[24px] size-[7px] rounded-full ring-4 ring-white ${dotTones[event.tone ?? "neutral"]}`} aria-hidden />
              <span className="text-ink/75">{event.text}</span>
              {event.time && <span className="shrink-0 text-[12px] text-ink/40 tabular-nums">{event.time}</span>}
            </li>
          ))}
        </ol>
      </div>
    </MockCard>
  );
}
