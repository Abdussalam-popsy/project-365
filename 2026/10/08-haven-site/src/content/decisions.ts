import type { Chip, TitlePart, TitledText } from "./agents/types";

// "Every decision, explained": why the agent dispatched Knox HVAC on WO-9002, as the record shows it.
// The rules it cites are the ones from the firm-context section, with the same scope tags.

export const decisionsIntro: { eyebrow: string; title: TitlePart[]; body: string } = {
  eyebrow: "Transparency",
  title: ["Every decision, ", { highlight: "explained." }],
  body: "Ask why an agent did something and the answer is the record itself: what it read, which of your rules applied, what it decided and who it told. Not a summary written after the fact.",
};

export const decisionEvent = {
  title: "Dispatched Knox HVAC · WO-9002",
  time: "7:44pm",
  chip: { label: "Emergency", tone: "red" } satisfies Chip,
};

export type TraceKind = "Read" | "Rule" | "Decided" | "Told";

export interface TraceStep {
  kind: TraceKind;
  text: string;
  /** Where a rule comes from, tagged like the firm-context card. */
  scope?: Chip;
}

export const decisionTrace: TraceStep[] = [
  { kind: "Read", text: "Chris's text: thermostat shows 68, blowing cold air" },
  { kind: "Read", text: "Weather at 220 Gay Street: 31°F tonight" },
  { kind: "Rule", text: "No heat under 55°F is an emergency", scope: { label: "Firm", tone: "violet" } },
  { kind: "Rule", text: "HVAC: Knox HVAC first, then Volunteer Air", scope: { label: "Property", tone: "green" } },
  { kind: "Decided", text: "Emergency. Send Knox HVAC tonight." },
  { kind: "Told", text: "Chris by text, and a note on WO-9002" },
];

export const decisionPoints: TitledText[] = [
  { title: "Every action logged", body: "Timestamped and attributable. Nothing an agent does happens off the record." },
  { title: "Every decision traced to your rules", body: "The Skill that applied, the threshold it checked and the evidence it used, in plain language." },
  { title: "Permissions enforced", body: "An agent can only use the tools you grant it. No tool, no action." },
  { title: "Your data stays yours", body: "Synced live from your PMS. Never siloed, never used to train a model." },
];
