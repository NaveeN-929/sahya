import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input / Textarea / Label
 * Plain form primitives — tokens only, 44px minimum tap target on Input, same focus-ring
 * and radius conventions as Button.
 */
const fieldClasses =
  "w-full rounded-input border border-border bg-surface px-4 py-2 text-sm text-ink " +
  "placeholder:text-ink-muted transition-colors duration-fast " +
  "focus-visible:outline-none focus-visible:shadow-focus-ring disabled:opacity-45 disabled:pointer-events-none";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClasses, "h-11", className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClasses, "min-h-[8rem] resize-y py-3", className)} {...props} />
));
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-ink", className)} {...props} />;
}
