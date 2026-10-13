import type { Chip } from "@/content/agents/types";
import type { SceneName } from "../DioramaHero";

export type Channel = "text" | "call" | "email";

/** One beat of the conversation: someone else's message, Haven's reply (typed out), or a status chip. */
export type ActivityStep =
  | { from: "them"; text: string }
  | { from: "haven"; text: string }
  | { status: Chip };

export interface Activity {
  channel: Channel;
  /** Who Haven is talking to, as the card's header shows it. */
  with: string;
  time: string;
  steps: ActivityStep[];
}

/**
 * What Haven is doing at each house, played out step by step when the house is in focus. Night leans on
 * after-hours emergencies, day on work moving along. "gay-street" is the WO-9002 case used across the site;
 * keep its details in step with the playbook. TODO(client): the rest is illustrative copy to confirm.
 */
export const houseActivity: Record<SceneName, Record<string, Activity>> = {
  night: {
    "gay-street": {
      channel: "text",
      with: "Chris Nolan · Unit B",
      time: "7:42pm",
      steps: [
        { from: "them", text: "The heat's out and it's getting cold in here." },
        { from: "haven", text: "Sorry Chris. Under 55°F is an emergency, so I'm sending Knox HVAC now." },
        { status: { label: "WO-9002 · Knox HVAC dispatched", tone: "green" } },
      ],
    },
    corner: {
      channel: "call",
      with: "Unit 4B",
      time: "2:14am",
      steps: [
        { from: "them", text: "There's water coming through the kitchen ceiling." },
        { from: "haven", text: "Please turn off the valve under the sink. A plumber is on the way." },
        { status: { label: "Emergency · Plumber dispatched", tone: "red" } },
      ],
    },
    gables: {
      channel: "email",
      with: "New lead · 2-bed",
      time: "11:08pm",
      steps: [
        { from: "them", text: "Is the 2-bed still available? Could I see it this weekend?" },
        { from: "haven", text: "It is. I can show it Saturday at 10am or 1pm. Which suits you?" },
        { from: "them", text: "10am, thanks!" },
        { status: { label: "Tour booked · Sat 10am", tone: "green" } },
      ],
    },
    far: {
      channel: "text",
      with: "Unit 2",
      time: "1:37am",
      steps: [
        { from: "them", text: "Locked out, sorry for the late text." },
        { from: "haven", text: "No problem. To confirm it's you, which month did you move in?" },
        { from: "them", text: "March" },
        { status: { label: "Verified · Locksmith en route", tone: "amber" } },
      ],
    },
    across: {
      channel: "text",
      with: "Unit 1A",
      time: "12:52am",
      steps: [
        { from: "them", text: "Loud music next door again." },
        { from: "haven", text: "Thanks for telling us. I've logged it and flagged it for your manager." },
        { status: { label: "Logged · Manager notified", tone: "violet" } },
      ],
    },
  },
  day: {
    "gay-street": {
      channel: "email",
      with: "Owner · 220 Gay Street",
      time: "Sep 13",
      steps: [
        { from: "haven", text: "Knox HVAC quoted $840 to fix the heating in unit B. Approve?" },
        { from: "them", text: "Approved, go ahead." },
        { status: { label: "Owner approved $840", tone: "green" } },
      ],
    },
    corner: {
      channel: "text",
      with: "Prospect · 2:30pm tour",
      time: "2:21pm",
      steps: [
        { from: "them", text: "Running 5 minutes late, sorry!" },
        { from: "haven", text: "No worries, the agent will wait for you. See you soon." },
        { status: { label: "Tour confirmed", tone: "green" } },
      ],
    },
    gables: {
      channel: "text",
      with: "Volunteer Air",
      time: "9:50am",
      steps: [
        { from: "haven", text: "Can you make 10:15am for the AC check at unit 3?" },
        { from: "them", text: "Yes, on our way." },
        { status: { label: "Vendor confirmed · 10:15am", tone: "amber" } },
      ],
    },
    far: {
      channel: "email",
      with: "Knox HVAC",
      time: "9:40am",
      steps: [
        { from: "them", text: "Repair finished, invoice attached." },
        { from: "haven", text: "Thanks! Invoice synced and the resident has been told." },
        { status: { label: "Work order closed", tone: "green" } },
      ],
    },
    across: {
      channel: "text",
      with: "Unit 1A",
      time: "3:05pm",
      steps: [
        { from: "haven", text: "Your lease ends Dec 31. Would you like to renew for 12 months?" },
        { from: "them", text: "Yes please!" },
        { status: { label: "Renewal sent", tone: "violet" } },
      ],
    },
  },
};
