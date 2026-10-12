import type { LineColumn } from "@/content/agents/types";
import { Reveal } from "../Reveal";

function Column({ column, accent }: { column: LineColumn; accent: boolean }) {
  return (
    <div className={`rounded-[28px] p-7 sm:p-9 ${accent ? "bg-night text-white" : "border border-ink/[0.07] bg-white"}`}>
      <h3 className="text-[24px] font-light tracking-[-0.02em]">{column.title}</h3>
      <p className={`mt-1 text-[14px] ${accent ? "text-lilac/80" : "text-ink/50"}`}>{column.subtitle}</p>
      <ul className="mt-7 flex flex-col">
        {column.items.map((item) => (
          <li key={item.title} className={`border-t py-4 ${accent ? "border-white/10" : "border-ink/[0.07]"}`}>
            <p className="text-[16px]">{item.title}</p>
            <p className={`mt-0.5 text-[14px] ${accent ? "text-white/50" : "text-ink/50"}`}>{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "The agent handles" beside "You decide": where automation stops and a person takes over. */
export function HumanLine({ agent, you, footnote }: { agent: LineColumn; you: LineColumn; footnote: string }) {
  return (
    <>
      <Reveal delay={0.1} className="mt-14 grid gap-5 lg:grid-cols-2">
        <Column column={agent} accent={false} />
        <Column column={you} accent />
      </Reveal>
      <p className="mx-auto mt-8 max-w-[620px] text-center text-[14px] text-ink/50">{footnote}</p>
    </>
  );
}
