import type { CallSample } from "@/content/agents/types";
import { PhoneIcon } from "../PhoneIcon";

/** A recorded call shown as a card: what it was, how it ended, and the transcript. Sits on a dark section. */
export function CallTranscript({ sample }: { sample: CallSample }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
      <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-5">
        <span className="grid size-11 place-items-center rounded-full bg-lilac/15 text-lilac">
          <PhoneIcon />
        </span>
        <div className="mr-auto">
          <p className="text-[16px] text-white">{sample.title}</p>
          <p className="text-[13px] text-white/45">{sample.when}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] tracking-[0.12em] text-white/40 uppercase">Outcome</p>
          <p className="text-[14px] text-lilac">{sample.outcome}</p>
        </div>
      </div>
      <ol className="mt-5 flex flex-col gap-4">
        {sample.lines.map((line, i) => (
          <li key={i} className="grid gap-1 sm:grid-cols-[130px_1fr] sm:gap-4">
            <span className={`text-[13px] ${line.haven ? "text-lilac" : "text-white/45"}`}>{line.speaker}</span>
            <p className={`text-[15px] leading-relaxed ${line.haven ? "text-white" : "text-white/70"}`}>{line.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 flex justify-between border-t border-white/10 pt-4 text-[12px] text-white/35">
        <span>{sample.note}</span>
        {sample.duration && <span className="tabular-nums">{sample.duration}</span>}
      </p>
    </div>
  );
}
