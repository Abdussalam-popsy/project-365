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
  /** How long the work took, for calendar blocks. */
  duration: number;
  agent: OutcomeAgent;
  text: string;
  place: string;
}

const at = (h: number, m: number) => h * 60 + m;

/** One sample day, in time order. Weighted to after hours, which is when the team is not there. */
export const outcomes: Outcome[] = [
  { minute: at(0, 20), duration: 40, agent: "Maintenance", text: "Emergency triaged, plumber dispatched", place: "Knoxville, TN" },
  { minute: at(0, 35), duration: 30, agent: "Receptionist", text: "After-hours call answered in Spanish", place: "Tucson, AZ" },
  { minute: at(0, 55), duration: 30, agent: "Leasing", text: "After-hours lead captured by phone", place: "Raleigh, NC" },
  { minute: at(1, 30), duration: 30, agent: "Maintenance", text: "After-hours maintenance call handled", place: "Austin, TX" },
  { minute: at(1, 50), duration: 30, agent: "Receptionist", text: "Caller verified and routed", place: "Columbus, OH" },
  { minute: at(2, 10), duration: 35, agent: "Leasing", text: "Lead qualified over the phone", place: "Denver, CO" },
  { minute: at(2, 45), duration: 35, agent: "Maintenance", text: "Issue fixed with the resident, no visit needed", place: "Nashville, TN" },
  { minute: at(3, 20), duration: 30, agent: "Receptionist", text: "Message taken, team notified", place: "Orlando, FL" },
  { minute: at(4, 10), duration: 30, agent: "Maintenance", text: "Vendor dispatched", place: "Phoenix, AZ" },
  { minute: at(5, 5), duration: 30, agent: "Leasing", text: "Lead converted into a tour", place: "Baltimore, MD" },
  { minute: at(5, 40), duration: 35, agent: "Maintenance", text: "Work order scheduled with the resident", place: "Memphis, TN" },
  { minute: at(6, 5), duration: 30, agent: "Receptionist", text: "Caller verified and routed", place: "Kansas City, MO" },
  { minute: at(6, 30), duration: 30, agent: "Leasing", text: "After-hours lead captured by phone", place: "Richmond, VA" },
  { minute: at(7, 0), duration: 30, agent: "Maintenance", text: "Repair confirmed complete", place: "Fresno, CA" },
  { minute: at(8, 40), duration: 35, agent: "Leasing", text: "Lead qualified over the phone", place: "Boise, ID" },
  { minute: at(9, 30), duration: 35, agent: "Maintenance", text: "Vendor dispatched", place: "Tampa, FL" },
  { minute: at(10, 20), duration: 30, agent: "Receptionist", text: "Call answered in Spanish", place: "Reno, NV" },
  { minute: at(11, 15), duration: 30, agent: "Leasing", text: "Lead converted into a tour", place: "Knoxville, TN" },
  { minute: at(12, 10), duration: 30, agent: "Maintenance", text: "Work order scheduled", place: "Tucson, AZ" },
  { minute: at(13, 30), duration: 40, agent: "Leasing", text: "Lead converted into an application", place: "Raleigh, NC" },
  { minute: at(14, 40), duration: 30, agent: "Maintenance", text: "Repair confirmed complete", place: "Austin, TX" },
  { minute: at(15, 10), duration: 30, agent: "Receptionist", text: "Caller verified and routed", place: "Columbus, OH" },
  { minute: at(16, 0), duration: 30, agent: "Leasing", text: "Lead qualified over the phone", place: "Denver, CO" },
  { minute: at(16, 50), duration: 35, agent: "Maintenance", text: "Issue troubleshot with the resident", place: "Nashville, TN" },
  { minute: at(18, 20), duration: 30, agent: "Leasing", text: "Tour booked the same evening", place: "Orlando, FL" },
  { minute: at(18, 40), duration: 35, agent: "Maintenance", text: "After-hours maintenance call handled", place: "Phoenix, AZ" },
  { minute: at(18, 55), duration: 30, agent: "Receptionist", text: "Message taken, team notified", place: "Baltimore, MD" },
  { minute: at(19, 30), duration: 35, agent: "Leasing", text: "After-hours lead qualified by phone", place: "Memphis, TN" },
  { minute: at(19, 55), duration: 40, agent: "Maintenance", text: "Emergency triaged, HVAC on the way", place: "Kansas City, MO" },
  { minute: at(20, 15), duration: 30, agent: "Receptionist", text: "After-hours call answered in Spanish", place: "Richmond, VA" },
  { minute: at(20, 40), duration: 30, agent: "Leasing", text: "Lead converted into a tour", place: "Fresno, CA" },
  { minute: at(21, 10), duration: 30, agent: "Maintenance", text: "Vendor dispatched", place: "Boise, ID" },
  { minute: at(21, 45), duration: 30, agent: "Receptionist", text: "Caller verified and routed", place: "Tampa, FL" },
  { minute: at(22, 0), duration: 40, agent: "Leasing", text: "Lead converted into an application", place: "Reno, NV" },
  { minute: at(22, 30), duration: 40, agent: "Maintenance", text: "Leak isolated, vendor booked", place: "Knoxville, TN" },
  { minute: at(23, 5), duration: 30, agent: "Leasing", text: "After-hours lead captured by phone", place: "Tucson, AZ" },
  { minute: at(23, 20), duration: 30, agent: "Maintenance", text: "Work order scheduled", place: "Raleigh, NC" },
  { minute: at(23, 25), duration: 30, agent: "Receptionist", text: "Message taken, team notified", place: "Austin, TX" },
];

/** The team's working hours, so the strip can shade everything outside them. */
export const workingHours = { start: at(8, 0), end: at(18, 0) };

export const outcomesNote = "A sample day, for illustration.";
