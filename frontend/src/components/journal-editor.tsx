import * as React from "react";
import { Check, Circle, Lock, Save } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/* ----------------------------- JournalEditor ----------------------------- */
/**
 * JournalEditor
 * Distraction-free writing surface — no toolbar clutter. Autosave status communicates
 * privacy + persistence without requiring the user to think about it.
 */
export interface JournalEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saveState?: "idle" | "saving" | "saved";
  prompt?: string;
}
export function JournalEditor({ value, onChange, onSave, saveState = "idle", prompt }: JournalEditorProps) {
  return (
    <div className="rounded-card-lg border border-border bg-surface p-6">
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" strokeWidth={1.75} /> Private — only visible to you
        </span>
        <span className="flex items-center gap-1">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && (
            <>
              <Check className="h-3 w-3 text-secondary-500" /> Saved
            </>
          )}
        </span>
      </div>

      {prompt && (
        <p className="mt-4 rounded-card bg-muted px-4 py-3 text-sm italic text-ink-secondary">{prompt}</p>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write whatever's on your mind. No structure required."
        rows={10}
        className="mt-4 w-full resize-none rounded-input border border-border bg-canvas p-4 font-body text-base leading-relaxed text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:shadow-focus-ring"
      />

      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={onSave}>
          <Save className="h-4 w-4" strokeWidth={1.75} /> Save entry
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------- ProgressTracker ----------------------------- */
/**
 * ProgressTracker
 * Used for multi-step flows (onboarding, a recovery/safety plan, legal process walkthroughs).
 * Vertical timeline form. Completed steps use secondary (emerald) — never a loud "success" green.
 */
export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: "complete" | "current" | "upcoming";
}
export interface ProgressTrackerProps {
  steps: ProgressStep[];
}
export function ProgressTracker({ steps }: ProgressTrackerProps) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className={cn(
                "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px",
                step.status === "complete" ? "bg-secondary-400" : "bg-border"
              )}
            />
          )}
          <span
            className={cn(
              "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
              step.status === "complete" && "border-secondary-500 bg-secondary-500 text-white",
              step.status === "current" && "border-primary-500 bg-surface text-primary-600",
              step.status === "upcoming" && "border-border bg-surface text-ink-muted"
            )}
          >
            {step.status === "complete" ? <Check className="h-4 w-4" /> : <Circle className="h-2 w-2 fill-current" />}
          </span>
          <div className="pt-1">
            <p className={cn("text-sm font-medium", step.status === "upcoming" ? "text-ink-muted" : "text-ink")}>
              {step.title}
            </p>
            {step.description && <p className="mt-0.5 text-xs text-ink-muted">{step.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
