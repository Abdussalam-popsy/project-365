import type { CallLogEntry } from "@/content/agents/types";
import { PhoneIcon } from "../PhoneIcon";

/**
 * A live-looking call log that scrolls upwards forever. The list is rendered twice and the
 * strip moves up by exactly half its height, so the loop has no visible seam.
 */
export function CallLog({ entries }: { entries: CallLogEntry[] }) {
  const row = (entry: CallLogEntry, i: number, copy: number) => (
    <li
      key={`${copy}-${i}`}
      aria-hidden={copy === 1 || undefined}
      className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tray text-plum-800">
        <PhoneIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] text-ink">
          {entry.caller} · {entry.place}
        </span>
        <span className="block text-[13px] text-ink/50">{entry.outcome}</span>
      </span>
      <span className="text-[12px] text-ink/40 tabular-nums">{entry.time}</span>
    </li>
  );

  return (
    <div className="relative h-[460px] overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.03] px-5 [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)] sm:px-8">
      <ul className="animate-ticker flex flex-col gap-3 py-5">
        {entries.map((entry, i) => row(entry, i, 0))}
        {entries.map((entry, i) => row(entry, i, 1))}
      </ul>
    </div>
  );
}
