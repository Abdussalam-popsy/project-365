import type { Call, Carer, Client, CoverSuggestion } from "@/data/types";
import { calls as allCalls, carers } from "@/data/mock-agency";

function hasConflict(carerId: string, call: Call): boolean {
  return allCalls.some(
    (c) =>
      c.id !== call.id &&
      c.day === call.day &&
      c.status !== "cancelled" &&
      c.carerIds.includes(carerId) &&
      c.time === call.time,
  );
}

function hoursRemaining(carer: Carer): number {
  return carer.weeklyHoursCap - carer.weeklyHoursScheduled;
}

export function rankCoverCandidates(
  call: Call,
  client: Client,
): CoverSuggestion[] {
  const suggestions: CoverSuggestion[] = [];

  for (const carer of carers) {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    if (carer.region === client.region) {
      score += 40;
      reasons.push("Same region");
    } else {
      warnings.push("Different region");
    }

    if (call.requiresDriver) {
      if (carer.isDriver) {
        score += 30;
        reasons.push("Driver");
      } else {
        score -= 100;
        warnings.push("Driver required");
      }
    } else {
      score += 10;
      reasons.push("No driver needed");
    }

    if (hasConflict(carer.id, call)) {
      score -= 100;
      warnings.push("Schedule conflict");
    } else {
      score += 20;
      reasons.push("No conflict");
    }

    const remaining = hoursRemaining(carer);
    if (remaining <= 0) {
      score -= 50;
      warnings.push("At weekly hours cap");
    } else if (carer.employmentType === "student" && remaining < 4) {
      score -= 20;
      warnings.push(`${remaining}h left (student cap)`);
    } else {
      score += Math.min(remaining, 10);
      reasons.push(`${remaining}h available`);
    }

    if (score > 0) {
      suggestions.push({ carer, score, reasons, warnings });
    }
  }

  return suggestions.sort((a, b) => b.score - a.score);
}

export function draftCoverMessage(
  carer: Carer,
  client: Client,
  call: Call,
): string {
  return `Hi ${carer.name.split(" ")[0]}, hope you're well — can you please cover ${client.name} on ${call.day} at ${call.time} in ${client.region}? ${client.medicationSensitive ? "Please note: medication-sensitive client." : ""} Let me know, thanks!`;
}
