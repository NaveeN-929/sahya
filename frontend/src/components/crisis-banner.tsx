import * as React from "react";
import { LifeBuoy, Phone, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/**
 * CrisisBanner
 * Always available (typically pinned in the navbar or sidebar footer), never modal,
 * never blocks the screen. Tone is steady and reassuring — not alarmed. Uses the
 * restrained `emergency` red only on the action button, never as a full-bleed background,
 * so the banner itself doesn't read as frightening.
 *
 * Usage: render persistently in app shell. `dismissible` should default to false on
 * crisis-relevant pages (e.g. AI chat, journal) and true elsewhere if used as a one-time nudge.
 */
export interface CrisisBannerProps {
  onCallHelpline: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  className?: string;
}

export function CrisisBanner({ onCallHelpline, onDismiss, dismissible = false, className }: CrisisBannerProps) {
  return (
    <div
      role="region"
      aria-label="Crisis support"
      className={cn(
        "flex items-center gap-3 rounded-card border border-primary-200 bg-primary-50 px-4 py-3",
        "dark:border-primary-700 dark:bg-primary-950",
        className
      )}
    >
      <LifeBuoy className="h-5 w-5 shrink-0 text-primary-700 dark:text-primary-300" strokeWidth={1.75} aria-hidden="true" />
      <p className="flex-1 text-sm text-primary-900 dark:text-primary-100">
        If you&apos;re in immediate danger or thinking about harming yourself, help is available right now — you don&apos;t have to go through this alone.
      </p>
      <Button variant="emergency" size="sm" onClick={onCallHelpline} className="shrink-0">
        <Phone className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        Get help now
      </Button>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-sm p-1 text-primary-700 hover:bg-primary-100 focus-visible:outline-none focus-visible:shadow-focus-ring dark:text-primary-300 dark:hover:bg-primary-900"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

/**
 * EscalationCard
 * Shown inline within an AI chat conversation when crisis-detection signals are present.
 * Distinct from CrisisBanner: this is contextual (appears mid-conversation), warmer in tone,
 * and offers concrete next steps rather than a single phone action.
 */
export interface EscalationCardProps {
  onCallHelpline: () => void;
  onTalkToHuman: () => void;
  onContinueChat: () => void;
}
export function EscalationCard({ onCallHelpline, onTalkToHuman, onContinueChat }: EscalationCardProps) {
  return (
    <div className="max-w-md rounded-card-lg border border-primary-200 bg-surface p-5 shadow-2 dark:border-primary-700">
      <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300">
        <LifeBuoy className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        <p className="font-heading text-sm font-semibold">It sounds like things are really hard right now</p>
      </div>
      <p className="mt-2 text-sm text-ink-secondary">
        You don&apos;t have to carry this on your own. Here are a few ways to get support immediately.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Button variant="emergency" size="sm" onClick={onCallHelpline} className="justify-start">
          <Phone className="h-4 w-4" strokeWidth={1.75} /> Call a 24/7 crisis line
        </Button>
        <Button variant="outline" size="sm" onClick={onTalkToHuman} className="justify-start">
          Talk to a real person now
        </Button>
        <Button variant="ghost" size="sm" onClick={onContinueChat} className="justify-start text-ink-secondary">
          Keep talking with me for now
        </Button>
      </div>
    </div>
  );
}
