import type { Chip, TitlePart } from "./agents/types";

// "The leading and fastest-growing property managers run on Haven." One card per customer.
// TODO(client): confirm the firm list, permission to show each name, and the agents each one uses.
// Only Evernest (Leasing, from the client's mock), Real Capital Group (Maintenance + Leasing) and Rentor.com
// (Maintenance, AppFolio) are backed by something we have; HBR Rentals and Paradise Palm are placeholders.

export const customersIntro: { eyebrow: string; title: TitlePart[]; body: string } = {
  eyebrow: "Customers",
  title: ["The leading ", { highlight: "and fastest-growing" }, " property managers run on Haven."],
  body: "From national operators to the firms adding doors fastest, on the property management software they already use.",
};

export type AgentName = "Maintenance" | "Leasing" | "Receptionist";

export interface Customer {
  name: string;
  /** Agents the firm runs; empty while unconfirmed. */
  agents: AgentName[];
  /** The caption: the firm's name in bold, then this in grey. */
  line: string;
  /** The small Haven mock floating on the card. */
  mock: { title: string; line: string; chip: Chip };
  tone: "lilac" | "sage" | "amber" | "blush" | "mist";
}

export const customers: Customer[] = [
  {
    name: "Evernest",
    agents: ["Leasing"],
    line: "answers every rental lead in seconds, day or night.",
    mock: { title: "New lead · 3-bed", line: "Tour booked for Saturday, 11am", chip: { label: "Leasing", tone: "green" } },
    tone: "lilac",
  },
  {
    name: "Real Capital Group",
    agents: ["Maintenance", "Leasing"],
    line: "started with maintenance and added leasing once it saw the return.",
    mock: { title: "After-hours call · Unit 12", line: "Plumber dispatched, resident updated", chip: { label: "Maintenance", tone: "violet" } },
    tone: "sage",
  },
  {
    name: "Rentor.com",
    agents: ["Maintenance"],
    line: "replaced its call center, with work orders set up the way its AppFolio runs.",
    mock: { title: "Work order · AppFolio", line: "Created, triaged and assigned", chip: { label: "Maintenance", tone: "violet" } },
    tone: "amber",
  },
  {
    name: "HBR Rentals",
    agents: [],
    line: "[what Haven does for them, to confirm]",
    mock: { title: "[Agent in use]", line: "[An outcome for this firm]", chip: { label: "Agent", tone: "neutral" } },
    tone: "blush",
  },
  {
    name: "Paradise Palm",
    agents: [],
    line: "[what Haven does for them, to confirm]",
    mock: { title: "[Agent in use]", line: "[An outcome for this firm]", chip: { label: "Agent", tone: "neutral" } },
    tone: "mist",
  },
];

export const customersCta = { line: "See what Haven would take off your team's plate." };
