// Leasing Agent page copy. Facts follow the client's reference; the wording is ours.
import type { ChatMessage, Chip, Decision, Lanes, TitlePart, TitledText } from "./types";

export const leasingMeta = {
  title: "Leasing Agent | Haven",
  description:
    "Haven's Leasing Agent answers every prospect in seconds, qualifies them against your criteria, books tours and keeps applications moving.",
  demoSubject: "Leasing Agent demo",
};

export const leasingHero = {
  eyebrow: "Leasing Agent",
  title: ["Every prospect, ", { highlight: "answered in seconds" }, "."] as TitlePart[],
  body: "A lead fills in a listing at 11pm and hears back straight away, not the next business day. The Leasing Agent answers the question, checks the prospect against your criteria, offers real tour times and keeps the application moving, so nobody goes cold waiting for a callback.",
  secondary: { label: "See how it works", href: "#how-it-works" },
};

export const leasingThread = {
  messages: [
    { from: "them", text: "Is the 2-bed at 14 Oak still available? Could I see it this weekend?" },
    { from: "haven", label: "Haven · Leasing", text: "It is. It's $2,150 a month on a 12-month lease. I have Saturday at 11am or Sunday at 2pm for a tour. Which suits you better?" },
    { from: "them", text: "Saturday at 11 is perfect." },
  ] as ChatMessage[],
  status: [
    { label: "Tour booked · Sat 11am", tone: "green" },
    { label: "Application complete", tone: "violet" },
    { label: "Meets criteria", tone: "green" },
  ] as Chip[],
  decision: {
    heading: "Haven is waiting on you",
    title: "Approve application and send lease",
    meta: "14 Oak, Unit 2 · income and criteria verified",
    primary: "Approve and send",
    secondary: ["Edit", "Decline"],
  } as Decision,
};

export const leasingWhy = {
  eyebrow: "Why it matters",
  title: "Speed to lead decides who gets the tour.",
  body: "The first firm to reply usually books the tour. Most leads arrive after hours, at weekends and in bursts no team can staff for. The Leasing Agent answers each one the moment it lands, in your voice and by your rules.",
};

export const leasingFeatures = {
  eyebrow: "What it does",
  title: "From first inquiry to complete application, on the record.",
  items: [
    { title: "Answers every inquiry instantly", body: "Web leads, texts and calls get a real answer within seconds, day or night." },
    { title: "Qualifies against your criteria", body: "Income, pets, move-in date and occupancy are checked before a tour is offered." },
    { title: "Books and confirms tours", body: "Offers times that are actually free, schedules the tour and sends reminders to cut no-shows." },
    { title: "Keeps applications moving", body: "Sends the application, follows up on anything missing and keeps the file complete." },
    { title: "Stops at the human line", body: "Approving an applicant or sending a lease is your decision, so the agent brings it to you." },
  ] as TitledText[],
};

export const leasingBeats = {
  title: "Four beats on every lead.",
  items: [
    { title: "Answer", body: "Every inquiry gets a real reply the moment it lands, in your firm's voice." },
    { title: "Qualify", body: "Income, pets, move-in date and occupancy, checked before anything goes on the calendar." },
    { title: "Tour", body: "Real availability offered, the tour confirmed, and reminders sent to cut no-shows." },
    { title: "Advance", body: "The application sent and completed, then the binding decision brought to you." },
  ] as TitledText[],
};

export const leasingStops = {
  eyebrow: "Where it stops",
  title: "It knows which decisions stay yours.",
  body: "The Leasing Agent works at machine speed on everything that can be undone: answering, qualifying, scheduling and chasing paperwork. Anything binding waits for a person, whether that's approving an applicant, signing a lease or making an exception to policy.",
  lanes: {
    agentTitle: "The agent runs",
    agent: ["Inquiries", "Qualification", "Tours", "Applications"],
    youTitle: "You decide",
    you: ["Approvals", "Lease signing"],
    note: {
      title: "By design",
      body: "The agent never approves an applicant or commits your firm to a lease on its own. Those decisions reach you with the file already complete, so the judgment stays yours and the busywork doesn't.",
    },
  } as Lanes,
};

export const leasingCta = {
  title: "Watch it work a week of your leads.",
  body: "We run the Leasing Agent on a week of your real inquiries and show you exactly where it acts and where it waits.",
};
