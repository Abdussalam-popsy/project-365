import type { Chip, TitlePart, TitledText } from "./agents/types";

// "It knows your firm, down to the unit": the rules behind the WO-9002 case, layered from the firm down to
// unit B. A more specific rule replaces a broader one; the agent applies the most specific rule it has.

export const firmIntro: { eyebrow: string; title: TitlePart[]; body: string } = {
  eyebrow: "Firm context",
  title: ["It knows your firm. ", { highlight: "Down to the unit." }],
  body: "Every agent runs on your policies, written as Skills your team can read and change. Set them once for the firm, then adjust them for a portfolio, a property or a single unit. The agent always applies the most specific rule it has.",
};

export const scopes: TitledText[] = [
  { title: "Firm", body: "Your policies, written once: what counts as an emergency, how much the agent may spend, how it talks to residents." },
  { title: "Portfolio", body: "Adjust them where a portfolio works differently, like an owner who allows a higher spend limit." },
  { title: "Property", body: "Each building adds what's true there: the vendors to call first and where the keys are." },
  { title: "Unit", body: "And down to the resident: how they like to be reached, and what a vendor should know before knocking." },
];

/** Short names for the scope trail on the card, in the same order as `scopes`. */
export const scopeTrail = ["Your firm", "Rocky Top portfolio", "220 Gay Street", "Unit B"];

export const scopeTones: Chip["tone"][] = ["violet", "amber", "green", "neutral"];

export interface FirmRule {
  text: string;
  /** Index into `scopes`: where the rule is set. */
  level: number;
  /** A rule with the same key at a deeper level replaces this one. */
  key?: string;
}

export const firmRules: FirmRule[] = [
  { text: "No heat under 55°F is an emergency", level: 0 },
  { text: "Owner approval above $300", level: 0, key: "spend" },
  { text: "Owner approval above $500", level: 1, key: "spend" },
  { text: "HVAC: Knox HVAC first, then Volunteer Air", level: 2 },
  { text: "Keys at the office after 5pm", level: 2 },
  { text: "Chris prefers text to calls", level: 3 },
  { text: "Dog in the unit: tell the vendor", level: 3 },
];

export const firmCard = { title: "What the agent knows", record: "WO-9002 · Unit B" };

export const firmFeatures: TitledText[] = [
  { title: "Autonomy, per Skill", body: "Observe, suggest, ask before acting or act alone, set for each thing the agent does." },
  { title: "Vendors, by trade and property", body: "Who to call first, what counts as after hours, when to call instead of text." },
  { title: "Spend limits, per owner", body: "What the agent may approve on its own, and when the owner is asked." },
  { title: "Access, per property", body: "Lockboxes, key pickup, on-site staff and what to tell a vendor or prospect." },
  { title: "Residents, per unit", body: "Preferred language and channel, who else is on the lease, what not to ask." },
  { title: "Leasing rules, per listing", body: "Qualification criteria, pet policy and tour hours, applied in the conversation." },
];
