"use client";

import type { ChatMessage } from "@/content/agents/types";
import { ChatBubble, bubbleSide } from "../ChatThread";
import { SequenceReveal } from "./SequenceReveal";

interface LoopingChatProps {
  messages: ChatMessage[];
  /** Pieces revealed after the messages, in order (a work-order card, status chips, a decision…). */
  after?: React.ReactNode[];
  className?: string;
}

/** A conversation that plays out on the shared loop: each message, then whatever the conversation produced. */
export function LoopingChat({ messages, after = [], className = "flex flex-col gap-4" }: LoopingChatProps) {
  return (
    <SequenceReveal
      as="ul"
      className={className}
      items={[...messages.map((m, i) => <ChatBubble key={i} message={m} />), ...after]}
      itemClassNames={[...messages.map(bubbleSide), ...after.map(() => "mt-2")]}
    />
  );
}
