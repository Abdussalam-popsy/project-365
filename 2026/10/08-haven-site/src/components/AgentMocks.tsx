"use client";

import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

function Frame({ title, meta, children }: { title: string; meta: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(87,64,239,0.18),transparent)]" />
      <div className="border border-ink/10 bg-white shadow-[0_30px_80px_-30px_rgba(30,15,38,0.35)]">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
          <span className="text-[14px] font-medium">{title}</span>
          <span className="text-[12px] text-ink/45">{meta}</span>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const transcript = [
  { from: "resident", text: "Hi, there's water coming through the ceiling in my bathroom." },
  { from: "haven", text: "I'm sorry to hear that. Is the water actively leaking right now?" },
  { from: "resident", text: "Yes, it's dripping pretty fast." },
  { from: "haven", text: "I've marked this as an emergency and I'm dispatching a plumber now." },
];

export function MaintenanceMock() {
  return (
    <Frame title="Incoming call · Unit 4B" meta="2:14 AM">
      <div className="flex flex-col gap-2.5">
        {transcript.map((line, i) => (
          <motion.div
            key={i}
            className={`max-w-[85%] px-3.5 py-2.5 text-[14px] leading-snug ${
              line.from === "haven" ? "self-end bg-violet text-white" : "self-start bg-mist text-ink"
            }`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.45, ease }}
          >
            {line.text}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="mt-5 grid grid-cols-3 border border-ink/10 text-[12px]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 + transcript.length * 0.45, ease }}
      >
        {[
          ["Work order", "#2318 created"],
          ["Priority", "Emergency"],
          ["Vendor", "Dispatched"],
        ].map(([k, v]) => (
          <div key={k} className="border-r border-ink/10 px-3 py-2.5 last:border-r-0">
            <p className="text-ink/45">{k}</p>
            <p className="mt-0.5 font-medium">{v}</p>
          </div>
        ))}
      </motion.div>
    </Frame>
  );
}

const leads = [
  { name: "Maya Chen", source: "Zillow", status: "Tour booked", time: "12s" },
  { name: "Jordan Ellis", source: "Apartments.com", status: "Qualified", time: "9s" },
  { name: "Priya Shah", source: "SMS", status: "Following up", time: "14s" },
  { name: "Sam Ortiz", source: "Email", status: "Application sent", time: "21s" },
];

export function LeasingMock() {
  return (
    <Frame title="Leasing inbox" meta="Today">
      <div className="flex flex-col">
        {leads.map((lead, i) => (
          <motion.div
            key={lead.name}
            className="flex items-center justify-between border-b border-ink/10 py-3 last:border-b-0"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease }}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center bg-lilac/50 text-[12px] font-medium text-plum-800">
                {lead.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div>
                <p className="text-[14px] font-medium">{lead.name}</p>
                <p className="text-[12px] text-ink/45">via {lead.source}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-violet">{lead.status}</p>
              <p className="text-[11px] text-ink/45">replied in {lead.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

const upcoming = ["Vendor management", "Collections", "Renewals", "Move-ins", "Inspections"];

export function ComingSoonMock() {
  return (
    <Frame title="AI workers" meta="Roadmap">
      <div className="flex flex-wrap gap-2.5">
        {upcoming.map((item, i) => (
          <motion.span
            key={item}
            className="border border-dashed border-violet/40 px-3.5 py-2 text-[14px] text-plum-800"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease }}
          >
            {item}
          </motion.span>
        ))}
      </div>
      <p className="mt-6 text-[13px] text-ink/45">Trained on your policies, vendors and workflows.</p>
    </Frame>
  );
}
