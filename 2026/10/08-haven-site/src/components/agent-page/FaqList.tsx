import type { Faq } from "@/content/agents/types";

/** Questions as native <details> rows: keyboard and screen-reader friendly with no JavaScript. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="mx-auto mt-12 max-w-[820px] border-b border-ink/10">
      {items.map((item) => (
        <details key={item.question} className="group border-t border-ink/10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[18px] [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/50 transition-transform duration-200 group-open:rotate-45" aria-hidden>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
            </span>
          </summary>
          <p className="max-w-[680px] pb-6 text-[16px] leading-relaxed text-ink/60">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** System-of-record names: live ones solid, upcoming ones marked "next". */
export function SystemsList({ live, next }: { live: string[]; next: string[] }) {
  return (
    <ul className="mt-12 flex flex-wrap justify-center gap-3">
      {live.map((name) => (
        <li key={name} className="rounded-full border border-ink/10 bg-white px-5 py-2.5 text-[16px]">
          {name}
        </li>
      ))}
      {next.map((name) => (
        <li key={name} className="flex items-center gap-2 rounded-full border border-dashed border-ink/15 px-5 py-2.5 text-[16px] text-ink/50">
          {name}
          <span className="text-[11px] tracking-[0.1em] text-violet uppercase">Next</span>
        </li>
      ))}
    </ul>
  );
}
