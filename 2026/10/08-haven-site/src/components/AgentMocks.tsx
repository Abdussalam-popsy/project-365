"use client";

import type { ChatMessage, Chip as ChipData, WorkOrder } from "@/content/agents/types";
import { WorkOrderCard } from "./agent-page/ChatThread";
import { LoopingChat } from "./agent-page/motion/LoopingChat";
import { SequenceReveal } from "./agent-page/motion/SequenceReveal";
import { Chip, DateChip, MockCard, MockPanel } from "./agent-page/ui";

// The homepage Agents section mocks, built from the same pieces as the agent pages (rounded tray, white cards,
// chat bubbles, soft chips) and played on the same looping reveal, so the whole site shares one visual language.

/** The tray's title line: what this mock is, and when. */
function MockHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <span className="text-[14px] font-medium text-ink/80">{title}</span>
      <DateChip date={meta} />
    </div>
  );
}

const call: ChatMessage[] = [
  { from: "them", text: "Hi, there's water coming through the ceiling in my bathroom." },
  { from: "haven", label: "Haven · Maintenance", text: "I'm sorry to hear that. Is the water actively leaking right now?" },
  { from: "them", text: "Yes, it's dripping pretty fast." },
  { from: "haven", label: "Haven · Maintenance", text: "I've marked this as an emergency and I'm dispatching a plumber now." },
];

const callOrder: WorkOrder = {
  title: "WO-2318 · Ceiling leak, Unit 4B",
  date: "2:14am",
  chips: [
    { label: "Emergency", tone: "red" },
    { label: "Plumbing", tone: "violet" },
    { label: "Plumber dispatched", tone: "green" },
  ],
};

export function MaintenanceMock() {
  return (
    <MockPanel>
      <MockHeader title="Incoming call · Unit 4B" meta="2:14am" />
      <LoopingChat messages={call} after={[<WorkOrderCard key="order" order={callOrder} />]} />
    </MockPanel>
  );
}

const leads: { name: string; source: string; status: ChipData; time: string }[] = [
  { name: "Maya Chen", source: "Zillow", status: { label: "Tour booked", tone: "green" }, time: "12s" },
  { name: "Jordan Ellis", source: "Apartments.com", status: { label: "Qualified", tone: "violet" }, time: "9s" },
  { name: "Priya Shah", source: "SMS", status: { label: "Following up", tone: "amber" }, time: "14s" },
  { name: "Sam Ortiz", source: "Email", status: { label: "Application sent", tone: "neutral" }, time: "21s" },
];

export function LeasingMock() {
  return (
    <MockPanel>
      <MockHeader title="Leasing inbox" meta="Today" />
      <SequenceReveal
        as="ul"
        className="flex flex-col gap-2.5"
        items={leads.map((lead) => (
          <MockCard key={lead.name} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bubble text-[12px] font-medium text-heather">
              {lead.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] text-ink">{lead.name}</span>
              <span className="block text-[12px] text-ink/45">
                via {lead.source} · replied in {lead.time}
              </span>
            </span>
            <Chip chip={lead.status} />
          </MockCard>
        ))}
      />
    </MockPanel>
  );
}

const upcoming = ["Collections", "Renewals", "Move-ins", "Inspections"];

export function ComingSoonMock() {
  return (
    <MockPanel>
      <MockHeader title="AI workers" meta="Roadmap" />
      <MockCard className="px-5 py-5">
        <SequenceReveal
          as="ul"
          className="flex flex-wrap gap-2.5"
          items={upcoming.map((item) => (
            <span key={item} className="inline-block rounded-full border border-dashed border-heather/35 bg-page px-4 py-2 text-[14px] text-heather">
              {item}
            </span>
          ))}
        />
        <p className="mt-5 text-[13px] text-ink/45">Trained on your policies, vendors and workflows.</p>
      </MockCard>
    </MockPanel>
  );
}
