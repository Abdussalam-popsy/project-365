// Receptionist Agent page copy. Facts follow the client's reference; the wording is ours.
import type { CallLogEntry, CallSample, Lanes, TitlePart, TitledText } from "./types";

export const receptionistMeta = {
  title: "Receptionist Agent | Haven",
  description:
    "Haven's Receptionist answers every call to your office on the first ring, knows who is calling, and handles it or gets it to the right person.",
  demoSubject: "Receptionist Agent demo",
};

export const receptionistHero = {
  eyebrow: "Receptionist Agent",
  title: ["Every call to your office, ", { highlight: "answered on the first ring" }, "."] as TitlePart[],
  body: "Nights, weekends and the lunch rush included. The Receptionist recognises who is calling, works out what they need, and either handles it or puts it in front of the right person. No hold music, and no voicemail box nobody checks.",
  secondary: { label: "Hear it answer", href: "#voice-demo" },
};

/** Sample rows for the hero's scrolling call log. */
export const receptionistCallLog: CallLogEntry[] = [
  { time: "06:00", caller: "Resident", place: "Austin, TX", outcome: "Answered · routed" },
  { time: "11:13", caller: "Prospect", place: "Mesa, AZ", outcome: "Caller identified" },
  { time: "16:26", caller: "Owner", place: "Raleigh, NC", outcome: "Message delivered" },
  { time: "21:39", caller: "Vendor", place: "Provo, UT", outcome: "Put through to on-call" },
  { time: "02:52", caller: "Resident", place: "Tampa, FL", outcome: "Answered · resolved" },
  { time: "07:05", caller: "Prospect", place: "Omaha, NE", outcome: "Handed to leasing" },
  { time: "12:18", caller: "Owner", place: "Tulsa, OK", outcome: "Answered · routed" },
  { time: "17:31", caller: "Vendor", place: "Denver, CO", outcome: "Caller identified" },
  { time: "22:44", caller: "Resident", place: "Akron, OH", outcome: "Message delivered" },
  { time: "03:57", caller: "Prospect", place: "Boise, ID", outcome: "Put through to on-call" },
  { time: "08:10", caller: "Owner", place: "Fresno, CA", outcome: "Answered · resolved" },
  { time: "13:23", caller: "Vendor", place: "Reno, NV", outcome: "Handed to leasing" },
];

export const receptionistAlways = {
  eyebrow: "Around the clock",
  title: "The line is never busy.",
  body: "Every caller gets a real answer on the first ring: recognised, understood, and either helped or handed to a person. A call at 2am is handled the same way as one on a Tuesday morning.",
};

export const receptionistFeatures = {
  eyebrow: "What it does",
  title: "Every caller recognised and looked after.",
  items: [
    { title: "Answers instantly, around the clock", body: "First ring, every time. After-hours calls get the same care as Tuesday morning." },
    { title: "Knows who is calling", body: "Residents, prospects, owners and vendors are recognised and greeted with the context of who they are." },
    { title: "Works out what each caller needs", body: "Prospect questions, maintenance, rent and billing, dial-by-name and compliance, each sent down the lane your firm defines." },
    { title: "Takes messages that reach someone", body: "Messages go to the right person on your team, not into a voicemail box nobody opens." },
    { title: "Speaks the caller's language", body: "English and Spanish, switching mid-call when the caller does." },
    { title: "Puts emergencies through to a person", body: "A burst pipe at 11:47pm doesn't become a ticket. It goes straight to your on-call line with the details already collected." },
  ] as TitledText[],
};

export const receptionistCall = {
  eyebrow: "A real hand-off",
  title: "Hear it answer the phone.",
  body: [
    "An after-hours leak, picked up on the first ring. The Receptionist confirms who is calling and where, asks the one question that decides how urgent it is, and puts the resident through to your on-call line.",
    "The on-call person picks up already knowing the caller, the unit and the problem. Nobody has to start the story again.",
  ],
  sample: {
    title: "Kitchen leak · 220 Gay Street",
    when: "7:42pm · after hours",
    outcome: "Put through to on-call",
    lines: [
      { speaker: "Luis · resident", haven: false, text: "Hi, this is Luis Moreno in unit B at 220 Gay Street. Our kitchen sink is leaking pretty badly." },
      { speaker: "Haven", haven: true, text: "Thanks, Luis. I have you at 220 Gay Street, unit B. Is the water spreading right now, or is it a slow drip?" },
      { speaker: "Luis · resident", haven: false, text: "It's spreading. There's water under the cabinets." },
      { speaker: "Haven", haven: true, text: "That counts as an emergency, so I'm putting you through to the on-call line now. I've already passed on your unit and what's happening." },
    ],
    note: "Sample call. The names and address are made up.",
  } as CallSample,
};

export const receptionistBeats = {
  title: "Four beats on every call.",
  items: [
    { title: "Answer", body: "Picks up on the first ring with your greeting, your hours and your rules, around the clock." },
    { title: "Identify", body: "Name, unit and history come from your PMS before the second sentence." },
    { title: "Understand", body: "Sorts the call against the reasons for calling your firm has set up." },
    { title: "Act", body: "Routine calls are resolved on the spot. Anything that needs a person reaches one, with the context already gathered." },
  ] as TitledText[],
};

export const receptionistStops = {
  eyebrow: "Where it stops",
  title: "It knows what it shouldn't handle.",
  body: "The Receptionist runs inside the same harness as every Haven agent: its Skills set out what it may do, and anything outside them waits for a person. Emergencies, legal questions and judgment calls are handed off, never improvised.",
  lanes: {
    agentTitle: "Handled or routed by the agent",
    agent: ["Prospects", "Maintenance", "Rent", "Billing", "Dial-by-name", "Compliance"],
    youTitle: "Straight to a person",
    you: ["Emergencies"],
  } as Lanes,
};

export const receptionistCta = {
  title: "Hear it answer a week of your calls.",
  body: "We run the Receptionist on a week of your real inbound calls and show you exactly where it acts and where it hands off.",
};
