// Maintenance Agent page copy. Facts and sample data follow the client's reference; the wording is ours.
import type {
  CallSample, ChatMessage, Chip, Faq, LifecycleStep, LineColumn, LogEvent, StatusTimeline, TitlePart, TitledText, WorkOrder,
} from "./types";
import { systemsOfRecord } from "./shared";

export const maintenanceMeta = {
  title: "Maintenance Agent | Haven",
  description:
    "Haven's Maintenance Agent carries every work order from the first text to the paid invoice, inside your PMS and by your rules.",
  demoSubject: "Maintenance Agent demo",
};

export const maintenanceHero = {
  eyebrow: "Maintenance Agent",
  title: ["Every work order, carried from ", { highlight: "the first text" }, " to ", { highlight: "the paid invoice" }, "."] as TitlePart[],
  body: "Intake, triage, dispatch, scheduling and invoicing, run inside your PMS by your rules. It pauses for you wherever the decision is yours.",
  secondary: { label: "See the lifecycle", href: "#lifecycle" },
};

export const maintenanceLifecycle: LifecycleStep[] = [
  { label: { label: "Triaged", tone: "red" }, title: "No heat · WO-9002", date: "Sep 12", status: { label: "Emergency", tone: "red" } },
  { label: { label: "Dispatched to", tone: "amber" }, title: "Knox HVAC", date: "Sep 12", status: { label: "Accepted", tone: "green" } },
  { label: { label: "Scheduled", tone: "violet" }, title: "Tue 9–11am · resident agreed", date: "Sep 13" },
  { label: { label: "Confirmed", tone: "green" }, title: "Work done · DONE", date: "Sep 14" },
  { label: { label: "Invoiced", tone: "neutral" }, title: "Invoice #4471 · $840", date: "Sep 19", status: { label: "Attached", tone: "neutral" } },
];

export const maintenanceStages = {
  title: ["Seven stages. ", { highlight: "One work order" }, " the whole way."] as TitlePart[],
  body: "Most tools let go after intake. Haven stays with the work order through every hand-off, and writes each step back to your PMS as it happens.",
  items: [
    { title: "Intake", body: "Texts, calls and portal tickets answered the moment they arrive. Photos read, repeat reports merged." },
    { title: "Triage", body: "What is wrong, how urgent it is and which trade fixes it, judged by your categories and thresholds." },
    { title: "Dispatch", body: "Your preferred vendor for that trade and property, reached by text and then by phone, within your authority." },
    { title: "Schedule", body: "Vendor and resident settle on a time in one thread Haven runs. The window is written to your PMS." },
    { title: "Approve", body: "Extra work is priced against your spending limit. Under it, approved. Over it, the owner decides while the vendor waits." },
    { title: "Confirm", body: "The vendor confirms the job is done and the resident confirms the problem is gone. Nothing closes on an assumption." },
    { title: "Invoice", body: "The invoice is collected, matched to the work order and filed in your PMS next to its approval." },
  ] as TitledText[],
};

export const maintenanceTriage = {
  title: "Understood before anyone is sent out.",
  body: [
    "Residents describe symptoms, not causes. Haven reads the request, the photos and the unit's history, asks what a seasoned coordinator would ask, and works out the problem, the urgency and the right trade, usually before your team has opened the ticket.",
    "Fewer wasted trips, the right trade on the first visit, emergencies caught as they happen, and a work order your team can act on without reading the whole thread.",
  ],
  chat: [
    { from: "them", text: "No heat since last night, it's freezing in here." },
    { from: "haven", label: "Haven · one question", text: "Is the thermostat blank, or is it showing a temperature?" },
    { from: "them", text: "It says 68 but it's blowing cold air." },
  ] as ChatMessage[],
  workOrder: {
    title: "WO-9002 · No heat",
    date: "Sep 12",
    chips: [
      { label: "Emergency", tone: "red" },
      { label: "HVAC · Furnace", tone: "violet" },
      { label: "Dispatch", tone: "green" },
    ],
  } as WorkOrder,
  features: [
    { title: "Asks what a coordinator would ask", body: "Only the follow-up questions that matter, so the vendor knows what they are walking into." },
    { title: "Sorts every request", body: "Each request gets a category and sub-category from one taxonomy, extended with your firm's own defaults." },
    { title: "Sets urgency by your rules", body: "Emergency, high, normal or low comes from your defaults per sub-category: no heat moves tonight, a slow drain waits for Monday." },
    { title: "Reads photos and video", body: "Images are matched to the right open work order and reviewed before anyone asks. It only requests one when it would change the outcome." },
    { title: "Fixes the simple things", body: "A tripped breaker, a reset, a clogged filter. When it is safe, Haven talks the resident through it and closes the ticket if that works." },
    { title: "Catches repeat reports", body: "A new report about an open issue on the same unit joins the existing work order instead of starting another." },
    { title: "Knows who is responsible", body: "If the repair falls to the resident, your policy decides whether Haven tells them, carries on, or passes it to you." },
    { title: "Spots emergencies at any point", body: "In the first message or the fourth, in a photo, or when a cold snap crosses your heat threshold. A known outage pauses dispatch." },
    { title: "Escalates once, to the right person", body: "A safety concern, a request for a human, or anything it cannot read becomes one escalation on Slack, email or text, with the thread attached." },
  ] as TitledText[],
};

export const maintenanceDispatch = {
  title: "Dispatched, scheduled and confirmed finished.",
  body: "The vendor you would have chosen, reached the way vendors actually respond, and followed through to the end. The work order is assigned in your PMS before anyone is contacted.",
  log: {
    heading: "Vendors · HVAC",
    vendor: "Knox HVAC · preferred",
    date: "Sep 12",
    events: [
      { text: "Texted", time: "7:44pm" },
      { text: "No reply after 5 minutes", tone: "amber" },
      { text: "Calling", time: "7:49pm" },
      { text: "Accepted · ETA 45 min", time: "7:51pm", tone: "green" },
      { text: "Work order assigned in your PMS" },
      { text: "Resident texted the arrival window", time: "7:52pm" },
      { text: "PM note added", time: "7:52pm" },
    ] as LogEvent[],
  },
  blocks: [
    {
      title: "Dispatch within your authority",
      body: "Your preferred vendor for the trade and property group gets a text, then a call if the text goes unanswered. A decline or silence moves to the next vendor, or to you, as you choose. Emergencies climb from vendor to on-call to notify-only.",
    },
    {
      title: "Scheduled by the people doing the work",
      body: "Vendor and resident agree a time in a thread Haven hosts and watches, and the window goes on the work order. After the visit, Haven checks with the vendor that the job is finished and with the resident that the problem is gone. Only then does the work order close.",
    },
  ] as TitledText[],
  thread: [
    { from: "party", label: "Knox HVAC", text: "I can do Tuesday, 9 to 11." },
    { from: "them", text: "Tuesday works for me." },
    { from: "haven", label: "Haven · Wednesday 10:02am", text: "Is the job finished, or is more work needed? Reply DONE or MORE." },
    { from: "party", label: "Knox HVAC", text: "DONE" },
  ] as ChatMessage[],
  /** The work order above the thread; its chip changes as messages arrive (`from` = messages shown so far). */
  threadOrder: {
    title: "WO-9002 · No heat",
    status: [
      { from: 0, chip: { label: "Vendor accepted", tone: "amber" } },
      { from: 2, chip: { label: "Scheduled · Tue 9–11am", tone: "green" } },
      { from: 4, chip: { label: "Resolved", tone: "violet" } },
    ],
  } as StatusTimeline,
};

export const maintenanceApprovals = {
  title: "Estimates, approvals and invoices, without chasing anyone.",
  body: "When a vendor finds more work, Haven collects a structured estimate and checks it against that property's spending limit.",
  cards: [
    { title: "Within the limit", body: "Approved automatically. The vendor is cleared to go ahead and you get a single note." },
    { title: "Over the limit", body: "The owner gets an approval request by text or email with the scope, cost and vendor, with reminders at 24, 48 and 72 hours. The vendor is asked to hold." },
    { title: "After the job", body: "The invoice is collected, matched to the work order and attached in your PMS with its approval trail." },
  ] as TitledText[],
  estimate: {
    heading: "Estimate · Knox HVAC",
    date: "Sep 14",
    limit: { label: "Over your $500 limit", tone: "amber" } as Chip,
    amount: "$840",
    item: "Furnace control board",
    approval: "Owner approval · 1450 Cedar Bluff Way",
    approved: "Knox HVAC · approved to proceed",
    invoice: { title: "Invoice #4471 · $840", date: "Sep 19", chip: { label: "Attached to WO", tone: "neutral" } as Chip },
  },
};

export const maintenanceCall = {
  title: "Listen to it handle a call.",
  body: [
    "An after-hours no-heat call, from hello to a booked technician. The agent recognises the unit from the caller's number, asks the one question that matters, applies your emergency rule and books within your authority. Nobody waits on hold.",
    "Every call is recorded, transcribed and added to the work order, so the morning team reads a record, not a voicemail.",
  ],
  sample: {
    title: "No heat · 220 Gay Street",
    when: "7:42pm · after hours",
    outcome: "HVAC technician booked",
    duration: "0:32",
    lines: [
      { speaker: "Chris · resident", haven: false, text: "Hi, it's Chris Nolan at 220 Gay Street, unit B. The heat's not working and it's getting cold in here." },
      { speaker: "Haven", haven: true, text: "Sorry to hear that, Chris. I have you at 220 Gay Street, unit B. Is the thermostat screen blank, or is it showing a temperature?" },
      { speaker: "Chris · resident", haven: false, text: "It says 68, but it's blowing cold air." },
      { speaker: "Haven", haven: true, text: "Thanks, that points to the furnace. With tonight's temperatures this is an emergency, so I'm booking an HVAC technician now. Will someone be home to let them in?" },
      { speaker: "Chris · resident", haven: false, text: "Yes, I'll be here." },
      { speaker: "Haven", haven: true, text: "Great. I'll text you the arrival window as soon as the technician confirms, and your property manager has the full record." },
    ],
    note: "Sample call. The names and address are made up.",
  } as CallSample,
};

export const maintenanceHumanLine = {
  title: "Instant where it can be undone. Waiting where it can't.",
  body: "Property management is fiduciary work. The Maintenance Agent moves at machine speed on anything inside your policy, and brings you only the decisions that involve money, risk or judgment.",
  agent: {
    title: "The agent handles",
    subtitle: "Reversible, within policy, logged. Day and night.",
    items: [
      { title: "Answering and triaging every request", body: "Photos, duplicates and tickets that bundle two problems included" },
      { title: "Suggesting a safe fix", body: "Never electrical, gas or structural" },
      { title: "Dispatching below your threshold", body: "Your vendors, property groups and emergency rules" },
      { title: "Scheduling and confirming", body: "With the vendor and the resident, in writing" },
      { title: "Collecting estimates and invoices", body: "As structured forms on the work order" },
    ],
  } as LineColumn,
  you: {
    title: "You decide",
    subtitle: "Prepared for you, waiting for you.",
    items: [
      { title: "Spending above the limit", body: "It is the owner's money" },
      { title: "Owner approvals", body: "Drafted and sent only the way you set up" },
      { title: "Unclear responsibility", body: "Resident, owner or cause-dependent, when policy can't tell" },
      { title: "Wrong trade or unfinished jobs", body: "Reassigning is your call unless you delegate it" },
      { title: "Anything outside its Skills", body: "If it isn't written down, it waits" },
    ],
  } as LineColumn,
  footnote: "Every message, call, decision and note is one record you can inspect, written back to the work order in your PMS.",
};

export const maintenanceSystems = {
  ...systemsOfRecord,
  body: "No second database to keep in sync. Work orders, vendors, notes and statuses stay where your team already looks.",
};

export const maintenanceFaq: Faq[] = [
  { question: "How do residents reach it?", answer: "By text, by phone and through your resident portal. A work order created in your PMS from any channel goes through the same triage." },
  { question: "How is this different from a chatbot that takes messages?", answer: "It finishes the work order. It categorises against your taxonomy, applies your priorities and responsibility policy, dispatches within your authority, schedules, confirms with both sides and chases the paperwork." },
  { question: "What will it never do on its own?", answer: "Spend above your limit, send an owner anything binding, settle an unclear responsibility question, or act outside its Skills. Those come to you prepared, and wait." },
  { question: "Which property management systems does it work with?", answer: "AppFolio, Buildium and Rentvine today, with Rent Manager and Propertyware next. It reads and writes the work order where it already lives." },
  { question: "What happens after hours?", answer: "The same agent, still awake. An emergency is flagged the moment the evidence appears, and vendor outreach steps up from text to phone until someone accepts." },
  { question: "Do we keep our vendors?", answer: "Yes. Haven dispatches your preferred vendor for the trade and property group, and only reassigns if you switch that on." },
  { question: "How do we get started?", answer: "Book a demo. We run the agent on a week of your real requests and show you exactly where it acts and where it waits." },
];

export const maintenanceCta = {
  title: "Try it on a week of your own requests.",
  body: "We run the Maintenance Agent on your real calls, texts and tickets and show you exactly where it acts and where it waits.",
};
