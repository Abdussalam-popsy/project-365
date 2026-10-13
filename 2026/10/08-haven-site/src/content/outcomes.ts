import type { TitlePart } from "./agents/types";

// "Outcomes, around the clock": a sample day of what the agents get done. Illustrative, not live data.

export const outcomesIntro: { eyebrow: string; title: TitlePart[]; body: string } = {
  eyebrow: "Outcomes",
  title: ["Outcomes, ", { highlight: "around the clock." }],
  body: "Not calls logged. Leads turned into tours, emergencies caught at midnight, repairs confirmed done. Day and night.",
};

export type OutcomeAgent = "Maintenance" | "Leasing" | "Receptionist";

export interface Outcome {
  /** Minutes after midnight. */
  minute: number;
  agent: OutcomeAgent;
  text: string;
  place: string;
}

const at = (h: number, m: number) => h * 60 + m;

/** One sample day, in time order. Weighted to after hours, which is when the team is not there. */
export const outcomes: Outcome[] = [
  { minute: at(0, 42), agent: "Maintenance", text: "Emergency triaged, plumber dispatched", place: "Knoxville, TN" },
  { minute: at(1, 55), agent: "Receptionist", text: "After-hours call answered in Spanish", place: "Tucson, AZ" },
  { minute: at(3, 10), agent: "Maintenance", text: "Issue fixed with the resident, no visit needed", place: "Raleigh, NC" },
  { minute: at(5, 30), agent: "Leasing", text: "After-hours lead captured by phone", place: "Austin, TX" },
  { minute: at(6, 48), agent: "Maintenance", text: "Work order scheduled with the resident", place: "Columbus, OH" },
  { minute: at(8, 15), agent: "Leasing", text: "Lead qualified over the phone", place: "Denver, CO" },
  { minute: at(10, 5), agent: "Maintenance", text: "Vendor dispatched", place: "Nashville, TN" },
  { minute: at(11, 40), agent: "Leasing", text: "Lead converted into a tour", place: "Orlando, FL" },
  { minute: at(13, 20), agent: "Maintenance", text: "Repair confirmed complete", place: "Knoxville, TN" },
  { minute: at(15, 0), agent: "Leasing", text: "Lead converted into an application", place: "Phoenix, AZ" },
  { minute: at(17, 35), agent: "Receptionist", text: "Caller verified and routed", place: "Baltimore, MD" },
  { minute: at(19, 50), agent: "Maintenance", text: "After-hours maintenance call handled", place: "Memphis, TN" },
  { minute: at(20, 45), agent: "Leasing", text: "Tour booked the same evening", place: "Kansas City, MO" },
  { minute: at(21, 30), agent: "Maintenance", text: "Emergency triaged, HVAC on the way", place: "Richmond, VA" },
  { minute: at(22, 40), agent: "Leasing", text: "After-hours lead qualified by phone", place: "Fresno, CA" },
  { minute: at(23, 25), agent: "Maintenance", text: "Leak isolated with the resident, vendor booked", place: "Boise, ID" },
];

/** The team's working hours, so the strip can shade everything outside them. */
export const workingHours = { start: at(8, 0), end: at(18, 0) };

export const outcomesNote = "A sample day, for illustration.";
