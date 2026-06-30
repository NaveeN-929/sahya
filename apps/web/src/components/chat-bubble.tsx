import * as React from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------- ChatBubble ----------------------------- */
/* Plain user/AI text turn. Keep visually quiet — the AI companion's distinctiveness
   comes from AIMessageCard's framing, not from a flashy bubble style. */
export interface ChatBubbleProps {
  role: "user" | "assistant";
  children: React.ReactNode;
  timestamp?: string;
}
export function ChatBubble({ role, children, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-card px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-primary-500 text-white" : "bg-muted text-ink"
        )}
      >
        {children}
        {timestamp && (
          <div className={cn("mt-1 text-[11px] opacity-60", isUser ? "text-white" : "text-ink-muted")}>{timestamp}</div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- TypingIndicator ----------------------------- */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-card bg-muted px-4 py-3 w-fit" aria-label="Companion is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-muted"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

/* ----------------------------- AIMessageCard ----------------------------- */
/**
 * AIMessageCard
 * The signature AI companion presentation — distinct from a generic chatbot bubble.
 * Carries a small identity mark (soft sparkle, not a robot avatar), supports inline
 * follow-up suggestion chips, and optional feedback controls. Never uses a stark
 * black/white "terminal" chat aesthetic.
 */
export interface AIMessageCardProps {
  children: React.ReactNode;
  followUps?: string[];
  onFollowUp?: (text: string) => void;
  onFeedback?: (positive: boolean) => void;
  onCopy?: () => void;
}
export function AIMessageCard({ children, followUps, onFollowUp, onFeedback, onCopy }: AIMessageCardProps) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
        <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="flex-1 rounded-card-lg border border-border bg-surface p-4">
        <div className="text-sm leading-relaxed text-ink">{children}</div>

        {followUps && followUps.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {followUps.map((text) => (
              <button
                key={text}
                onClick={() => onFollowUp?.(text)}
                className="rounded-full border border-border bg-canvas px-3 py-1.5 text-xs text-ink-secondary transition-colors duration-fast hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:shadow-focus-ring"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 border-t border-border pt-2">
          <button onClick={onCopy} aria-label="Copy response" className="rounded-sm p-1.5 text-ink-muted hover:bg-muted focus-visible:outline-none focus-visible:shadow-focus-ring">
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button onClick={() => onFeedback?.(true)} aria-label="Helpful" className="rounded-sm p-1.5 text-ink-muted hover:bg-muted focus-visible:outline-none focus-visible:shadow-focus-ring">
            <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button onClick={() => onFeedback?.(false)} aria-label="Not helpful" className="rounded-sm p-1.5 text-ink-muted hover:bg-muted focus-visible:outline-none focus-visible:shadow-focus-ring">
            <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- ConversationStarterCard ----------------------------- */
export interface ConversationStarterCardProps {
  prompt: string;
  description: string;
  onClick: () => void;
}
export function ConversationStarterCard({ prompt, description, onClick }: ConversationStarterCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-card border border-border bg-surface p-4 text-left transition-all duration-fast hover:border-primary-300 hover:shadow-2 focus-visible:outline-none focus-visible:shadow-focus-ring"
    >
      <p className="font-medium text-ink">{prompt}</p>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
    </button>
  );
}
