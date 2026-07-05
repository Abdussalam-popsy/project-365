import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { candidates, calls } from "@/data/mock-agency";

const quickPrompts = [
  "Who's missing DBS?",
  "Show today's gaps",
  "Candidates in shadow stage",
];

function mockReply(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("dbs") || q.includes("missing")) {
    const pending = candidates.filter((c) => !c.documents.dbs);
    return pending.length
      ? `**${pending.length} candidates** missing DBS:\n${pending.map((c) => `• ${c.name} (${c.stage})`).join("\n")}`
      : "All active candidates have DBS submitted.";
  }
  if (q.includes("gap")) {
    const gaps = calls.filter((c) => c.status === "gap" || c.status === "cancelled");
    return gaps.length
      ? `**${gaps.length} calls need attention** this week:\n${gaps.map((c) => `• ${c.day} ${c.time} — ${c.status}`).join("\n")}\n\nOpen Schedule to find cover.`
      : "No gaps or cancellations this week.";
  }
  if (q.includes("shadow")) {
    const shadow = candidates.filter((c) => c.stage === "shadow");
    return shadow.length
      ? `**${shadow.length} in shadow stage:**\n${shadow.map((c) => `• ${c.name} — ${c.daysInStage}d in stage`).join("\n")}`
      : "No candidates in shadow stage.";
  }
  return "I can help with onboarding status, cover gaps, and missing documents. Try a quick prompt below.";
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function CopilotDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm your ops copilot. Ask about onboarding, cover gaps, or missing docs — or use a quick prompt.",
    },
  ]);

  function send(text: string) {
    if (!text.trim()) return;
    const reply = mockReply(text);
    setMessages((m) => [
      ...m,
      { role: "user", content: text },
      { role: "assistant", content: reply },
    ]);
    setInput("");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Copilot
          </SheetTitle>
          <SheetDescription>
            Mock responses — will connect to real AI in platform
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5">
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === "user"
                    ? "ml-8 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-4 rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-line"
                }
              >
                {msg.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-3 border-t border-border p-5">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
            />
            <Button size="icon" onClick={() => send(input)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
