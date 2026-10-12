import type { ChatMessage, WorkOrder } from "@/content/agents/types";
import { Chip, DateChip, DocIcon, MockCard } from "./ui";

/** Message bubbles: the other side on the right in soft lilac-grey, Haven on the left as a raised white card. */
export function ChatThread({ messages }: { messages: ChatMessage[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {messages.map((m, i) =>
        m.from === "haven" ? (
          <li key={i} className="max-w-[88%] self-start">
            <MockCard className="px-5 py-4">
              {m.label && <p className="text-[13px] font-medium text-plum-800/80">{m.label}</p>}
              <p className="mt-1 text-[16px] leading-snug text-ink">{m.text}</p>
            </MockCard>
          </li>
        ) : (
          <li key={i} className="max-w-[80%] self-end">
            {m.label && <p className="mb-1 text-right text-[12px] text-ink/45">{m.label}</p>}
            <p className="rounded-2xl rounded-br-md bg-[#e4dcea] px-4 py-3 text-[16px] leading-snug text-ink">{m.text}</p>
          </li>
        ),
      )}
    </ul>
  );
}

/** The work order the conversation produced: title, date and status chips. */
export function WorkOrderCard({ order, faded = false }: { order: WorkOrder; faded?: boolean }) {
  return (
    <MockCard className={`px-5 py-4 ${faded ? "opacity-80" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <DocIcon />
        <p className="mr-auto text-[16px] text-ink/80">{order.title}</p>
        <DateChip date={order.date} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {order.chips.map((chip) => (
          <Chip key={chip.label} chip={chip} />
        ))}
      </div>
    </MockCard>
  );
}
