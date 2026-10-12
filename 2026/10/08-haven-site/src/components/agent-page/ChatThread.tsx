import type { ChatMessage, WorkOrder } from "@/content/agents/types";
import { Chip, DateChip, DocIcon, MockCard } from "./ui";

/** One message: the resident's grey bubble on the right, or a raised white card on the left (Haven or another party). */
export function ChatBubble({ message: m }: { message: ChatMessage }) {
  return m.from === "them" ? (
    <>
      {m.label && <p className="mb-1 text-right text-[12px] text-ink/45">{m.label}</p>}
      <p className="rounded-xl bg-bubble px-4 py-3 text-[16px] leading-snug text-ink">{m.text}</p>
    </>
  ) : (
    <MockCard className="px-5 py-4">
      {m.label && <p className="text-[13px] font-medium text-heather/85">{m.label}</p>}
      <p className="mt-1 text-[16px] leading-snug text-ink">{m.text}</p>
    </MockCard>
  );
}

/** Bubble alignment: the resident on the right, everyone else on the left. */
export const bubbleSide = (m: ChatMessage) => (m.from === "them" ? "max-w-[80%] self-end" : "max-w-[88%] self-start");

/** A static conversation. */
export function ChatThread({ messages }: { messages: ChatMessage[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {messages.map((m, i) => (
        <li key={i} className={bubbleSide(m)}>
          <ChatBubble message={m} />
        </li>
      ))}
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
