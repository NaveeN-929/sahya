import * as React from "react";
import { Phone, MessageCircleHeart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EmergencyActionCard
 * A larger, dashboard-level card (not a banner) offering the three most urgent actions:
 * call, text/chat with a crisis counselor, find nearby safe locations. Visually calmer
 * than the name implies — soft red accent only, generous whitespace, no flashing/urgent motion.
 */
export interface EmergencyActionCardProps {
  helplineNumber: string;
  onCall: () => void;
  onTextChat: () => void;
  onFindSafeLocation: () => void;
  className?: string;
}

export function EmergencyActionCard({
  helplineNumber,
  onCall,
  onTextChat,
  onFindSafeLocation,
  className,
}: EmergencyActionCardProps) {
  const actions = [
    { icon: Phone, label: "Call now", sublabel: helplineNumber, onClick: onCall },
    { icon: MessageCircleHeart, label: "Text a counselor", sublabel: "Usually replies in minutes", onClick: onTextChat },
    { icon: MapPin, label: "Find a safe place nearby", sublabel: "Shelters & support centers", onClick: onFindSafeLocation },
  ];

  return (
    <div
      role="region"
      aria-label="Emergency support options"
      className={cn(
        "rounded-card-lg border border-error-border bg-error-bg p-6",
        "dark:border-error-border dark:bg-error-bg",
        className
      )}
    >
      <h2 className="font-heading text-lg font-semibold text-error-fg">Need help right now?</h2>
      <p className="mt-1 text-sm text-error-fg/80">
        These options are free, confidential, and available immediately.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {actions.map(({ icon: Icon, label, sublabel, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={cn(
              "flex flex-col items-start gap-2 rounded-card border border-error-border/60 bg-surface p-4 text-left",
              "transition-colors duration-fast hover:bg-error-bg/40",
              "focus-visible:outline-none focus-visible:shadow-focus-ring"
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emergency/10 text-emergency">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="font-medium text-ink">{label}</span>
            <span className="text-xs text-ink-muted">{sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
