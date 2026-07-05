export type OnboardingStage =
  | "applied"
  | "screened"
  | "dbs_submitted"
  | "training_booked"
  | "shadow"
  | "live";

export type EmploymentType = "permanent" | "student" | "sponsored";

export type CallStatus = "covered" | "gap" | "cancelled";

export interface Agency {
  id: string;
  name: string;
}

export interface Carer {
  id: string;
  name: string;
  phone: string;
  region: string;
  isDriver: boolean;
  employmentType: EmploymentType;
  weeklyHoursCap: number;
  weeklyHoursScheduled: number;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  region: string;
  packageSummary: string;
  medicationSensitive: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  isDriver: boolean;
  experienceYears: number;
  availability: string;
  stage: OnboardingStage;
  daysInStage: number;
  documents: {
    dbs: boolean;
    id: boolean;
    training: boolean;
  };
  shadowClientId?: string;
  pairingCarerId?: string;
  appliedAt: string;
}

export interface Call {
  id: string;
  day: string;
  time: string;
  clientId: string;
  carerIds: string[];
  requiresDriver: boolean;
  isDouble: boolean;
  runLabel?: string;
  status: CallStatus;
  cancelledBy?: string;
}

export interface CoverSuggestion {
  carer: Carer;
  score: number;
  reasons: string[];
  warnings: string[];
}

export const ONBOARDING_STAGES: {
  id: OnboardingStage;
  label: string;
}[] = [
  { id: "applied", label: "Applied" },
  { id: "screened", label: "Screened" },
  { id: "dbs_submitted", label: "DBS" },
  { id: "training_booked", label: "Training" },
  { id: "shadow", label: "Shadow" },
  { id: "live", label: "Live" },
];

export function stageLabel(stage: OnboardingStage): string {
  return ONBOARDING_STAGES.find((s) => s.id === stage)?.label ?? stage;
}

export function missingDocuments(candidate: Candidate): string[] {
  const missing: string[] = [];
  if (!candidate.documents.dbs) missing.push("DBS");
  if (!candidate.documents.id) missing.push("ID");
  if (!candidate.documents.training) missing.push("Training");
  return missing;
}
