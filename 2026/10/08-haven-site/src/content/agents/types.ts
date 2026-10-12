// The shape every agent page's content follows. Components read these; pages only pick which sections to show.

/** Soft status-chip colours, as in the client's work-order mocks. */
export type ChipTone = "red" | "amber" | "green" | "violet" | "neutral";
export interface Chip {
  label: string;
  tone: ChipTone;
}

/** A headline in pieces; `highlight` pieces render in lilac. */
export type TitlePart = string | { highlight: string };

export interface TitledText {
  title: string;
  body: string;
}

export interface ChatMessage {
  /** "them" = resident/vendor/caller bubble on the right, "haven" = Haven's raised card on the left. */
  from: "them" | "haven";
  /** Small label above the message, e.g. "Haven · one question" or "Knox HVAC". */
  label?: string;
  text: string;
}

export interface WorkOrder {
  title: string;
  date: string;
  chips: Chip[];
}

/** One step in the hero's lifecycle diagram: a label chip, then a card. */
export interface LifecycleStep {
  label: Chip;
  title: string;
  date: string;
  status?: Chip;
}

export interface LogEvent {
  text: string;
  time?: string;
  tone?: ChipTone;
}

export interface TranscriptLine {
  speaker: string;
  haven: boolean;
  text: string;
}

export interface CallSample {
  title: string;
  when: string;
  outcome: string;
  duration: string;
  lines: TranscriptLine[];
  note: string;
}

export interface LineColumn {
  title: string;
  subtitle: string;
  items: TitledText[];
}

export interface Faq {
  question: string;
  answer: string;
}
