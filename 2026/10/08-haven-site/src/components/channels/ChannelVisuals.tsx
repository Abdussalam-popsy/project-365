"use client";

import type { Chip as ChipData } from "@/content/agents/types";
import { channelEmail, channelPhone, channelPms, channelText, type ChannelId } from "@/content/channels";
import { ChatBubble, bubbleSide } from "../agent-page/ChatThread";
import { SequenceReveal } from "../agent-page/motion/SequenceReveal";
import { Chip, DateChip, DocIcon, MockCard } from "../agent-page/ui";

// One mock per channel, all following the same WO-9002 case. Each plays the site's one looping reveal.

const STEP_MS = 700;
const HOLD_MS = 4000;

function Header({ title, right }: { title: string; right: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <span className="text-[14px] font-medium text-ink/80">{title}</span>
      {right}
    </div>
  );
}

/** The closing line of every mock: what this channel's step changed on the record. */
function Outcome({ chip }: { chip: ChipData }) {
  return (
    <div className="flex items-center gap-2 pt-1 text-[13px] text-ink/50">
      <DocIcon />
      <Chip chip={chip} />
    </div>
  );
}

function TextMock() {
  const { header, messages, outcome } = channelText;
  return (
    <>
      <Header title={header.title} right={<DateChip date={header.date} />} />
      <SequenceReveal
        className="flex flex-col gap-3"
        stepMs={STEP_MS}
        holdMs={HOLD_MS}
        itemClassNames={[...messages.map(bubbleSide), ""]}
        items={[...messages.map((m) => <ChatBubble key={m.text} message={m} />), <Outcome key="outcome" chip={outcome} />]}
      />
    </>
  );
}

function EmailMock() {
  const { header, sent, reply, outcome } = channelEmail;
  return (
    <>
      <Header title={header.title} right={<DateChip date={header.date} />} />
      <SequenceReveal
        className="flex flex-col gap-3"
        stepMs={STEP_MS}
        holdMs={HOLD_MS}
        itemClassNames={["", "max-w-[80%] self-end", ""]}
        items={[
          <MockCard key="sent" className="px-5 py-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-b border-ink/[0.06] pb-3 text-[13px]">
              <dt className="text-ink/40">From</dt>
              <dd className="text-heather/85">{sent.from}</dd>
              <dt className="text-ink/40">To</dt>
              <dd className="text-ink/70">{sent.to}</dd>
            </dl>
            <p className="mt-3 text-[15px] font-medium text-ink">{sent.subject}</p>
            <p className="mt-1 text-[15px] leading-snug text-ink/70">{sent.body}</p>
          </MockCard>,
          <div key="reply">
            <p className="mb-1 text-right text-[12px] text-ink/45">{reply.from}</p>
            <p className="rounded-xl bg-bubble px-4 py-3 text-[16px] leading-snug text-ink">{reply.body}</p>
          </div>,
          <Outcome key="outcome" chip={outcome} />,
        ]}
      />
    </>
  );
}

function PhoneMock() {
  const { header, lines, outcome } = channelPhone;
  return (
    <>
      <Header title={header.title} right={<DateChip date={header.date} />} />
      <SequenceReveal
        className="flex flex-col gap-3"
        stepMs={STEP_MS}
        holdMs={HOLD_MS}
        items={[
          ...lines.map((line) => (
            <MockCard key={line.text} className={`px-5 py-4 ${line.haven ? "" : "bg-bubble shadow-none"}`}>
              <p className={`text-[13px] font-medium ${line.haven ? "text-heather/85" : "text-ink/45"}`}>{line.speaker}</p>
              <p className="mt-1 text-[16px] leading-snug text-ink">{line.text}</p>
            </MockCard>
          )),
          <Outcome key="outcome" chip={outcome} />,
        ]}
      />
    </>
  );
}

function PmsMock() {
  const { header, notes, outcome } = channelPms;
  return (
    <>
      <Header title={header.title} right={<Chip chip={{ label: header.date, tone: "violet" }} />} />
      <MockCard className="px-5 py-2">
        <SequenceReveal
          as="ul"
          className="flex flex-col"
          stepMs={STEP_MS}
          holdMs={HOLD_MS}
          items={notes.map((note) => (
            <div key={note.time} className="flex flex-col gap-0.5 border-b border-ink/[0.06] py-3 sm:flex-row sm:gap-4">
              <span className="shrink-0 text-[13px] text-ink/40 tabular-nums sm:w-[124px]">{note.time}</span>
              <span className="text-[15px] text-ink/80">{note.text}</span>
            </div>
          ))}
        />
        <div className="py-3">
          <Outcome chip={outcome} />
        </div>
      </MockCard>
    </>
  );
}

export const channelMocks: Record<ChannelId, () => React.ReactNode> = {
  text: TextMock,
  email: EmailMock,
  phone: PhoneMock,
  pms: PmsMock,
};

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Channel icons, drawn in the current text colour. */
export const channelIcons: Record<ChannelId, React.ReactNode> = {
  text: (
    <svg {...iconProps}>
      <path d="M4 5h16v11H9l-5 4z" />
    </svg>
  ),
  email: (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </svg>
  ),
  phone: (
    <svg {...iconProps}>
      <path d="M5 3h3.5l1.8 4.6-2.3 1.4a11 11 0 0 0 7 7l1.4-2.3L21 15.5V19a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3z" />
    </svg>
  ),
  pms: (
    <svg {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
};
