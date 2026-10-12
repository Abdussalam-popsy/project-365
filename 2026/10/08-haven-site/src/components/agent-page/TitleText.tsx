import type { TitlePart } from "@/content/agents/types";

/**
 * A heading written as plain text, or as pieces where `{ highlight: "…" }` gets the accent colour:
 * lilac on dark backgrounds, muted plum (heather) on light ones.
 */
export function TitleText({ title, dark = false }: { title: string | TitlePart[]; dark?: boolean }) {
  if (typeof title === "string") return <>{title}</>;
  return (
    <>
      {title.map((part, i) =>
        typeof part === "string" ? part : <span key={i} className={dark ? "text-lilac" : "text-heather"}>{part.highlight}</span>,
      )}
    </>
  );
}
