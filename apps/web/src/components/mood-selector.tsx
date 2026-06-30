import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * MoodSelector
 * Single-tap daily mood check-in. Uses soft, abstract shape + color rather than
 * literal facial expressions (avoids cartoonish or infantilizing tone for an adult,
 * male-skewing audience). Color intensity — not face shape — communicates mood.
 */
const MOODS = [
  { key: "low", label: "Struggling", color: "bg-info-solid" },
  { key: "heavy", label: "Heavy", color: "bg-primary-600" },
  { key: "neutral", label: "Okay", color: "bg-neutral-400" },
  { key: "steady", label: "Steady", color: "bg-secondary-400" },
  { key: "good", label: "Good", color: "bg-secondary-600" },
] as const;

export type MoodKey = (typeof MOODS)[number]["key"];

export interface MoodSelectorProps {
  value?: MoodKey;
  onChange: (mood: MoodKey) => void;
  className?: string;
}

export function MoodSelector({ value, onChange, className }: MoodSelectorProps) {
  return (
    <fieldset className={cn("rounded-card-lg border border-border bg-surface p-5", className)}>
      <legend className="px-1 font-heading text-base font-semibold text-ink">How are you feeling today?</legend>
      <div className="mt-4 flex justify-between gap-2">
        {MOODS.map((mood) => {
          const selected = value === mood.key;
          return (
            <button
              key={mood.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(mood.key)}
              className="flex flex-1 flex-col items-center gap-2 rounded-card py-2 transition-transform duration-fast ease-spring hover:scale-[1.03] focus-visible:outline-none focus-visible:shadow-focus-ring"
            >
              <span
                className={cn(
                  "h-10 w-10 rounded-full transition-all duration-fast",
                  mood.color,
                  selected ? "ring-2 ring-offset-2 ring-primary-500 ring-offset-surface scale-110" : "opacity-70"
                )}
                aria-hidden="true"
              />
              <span className={cn("text-xs", selected ? "font-medium text-ink" : "text-ink-muted")}>{mood.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
