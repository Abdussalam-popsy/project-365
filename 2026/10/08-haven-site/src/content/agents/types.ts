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
  /**
   * "them" = the resident's grey bubble on the right. "haven" = Haven's raised white card on the left.
   * "party" = another participant (e.g. the vendor), also a white card on the left, named by `label`.
   */
  from: "them" | "haven" | "party";
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
  duration?: string;
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

/** A "waiting on you" card: a decision the agent prepared and won't make itself. */
export interface Decision {
  heading: string;
  title: string;
  meta: string;
  primary: string;
  secondary: string[];
}

/** Which kinds of work the agent runs, and which go to a person. */
export interface Lanes {
  agentTitle: string;
  agent: string[];
  youTitle: string;
  you: string[];
  note?: TitledText;
}

/** One row in the receptionist's live call log. */
export interface CallLogEntry {
  time: string;
  caller: string;
  place: string;
  outcome: string;
}

/** A record whose status chip changes as a thread plays: each chip applies once `from` messages are showing. */
export interface StatusTimeline {
  title: string;
  status: { from: number; chip: Chip }[];
}

/** A stage's snapshot of the work order, for the stepper's visual. */
export interface StageVisual {
  chip: Chip;
  line: string;
}

export interface Stat {
  value: string;
  label: string;
}
