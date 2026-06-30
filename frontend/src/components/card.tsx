import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------- Card ----------------------------- */
/* Resting elevation-1, hover elevation-2. Never use elevation-3/4 for static cards — reserve those for floating UI (popovers, dialogs). */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface p-6 shadow-1 transition-shadow duration-base hover:shadow-2",
        className
      )}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 flex flex-col gap-1", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-heading text-lg font-semibold text-ink", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-ink-secondary", className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex items-center gap-3", className)} {...props} />;
}

/* ----------------------------- Badge ----------------------------- */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-ink-secondary",
        primary: "bg-primary-50 text-primary-700",
        success: "bg-success-bg text-success-fg",
        warning: "bg-warning-bg text-warning-fg",
        info: "bg-info-bg text-info-fg",
        error: "bg-error-bg text-error-fg",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/* ----------------------------- Alert ----------------------------- */
/* Note: this is the general-purpose alert (form/system feedback). For platform crisis
   messaging, use <CrisisBanner /> instead — it has distinct copy and escalation behavior. */
const alertConfig = {
  success: { icon: CheckCircle2, classes: "bg-success-bg border-success-border text-success-fg" },
  warning: { icon: AlertTriangle, classes: "bg-warning-bg border-warning-border text-warning-fg" },
  info: { icon: Info, classes: "bg-info-bg border-info-border text-info-fg" },
  error: { icon: XCircle, classes: "bg-error-bg border-error-border text-error-fg" },
} as const;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: keyof typeof alertConfig;
  title: string;
}
export function Alert({ variant, title, children, className, ...props }: AlertProps) {
  const { icon: Icon, classes } = alertConfig[variant];
  return (
    <div role="status" className={cn("flex gap-3 rounded-card border p-4", classes, className)} {...props}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <div className="text-sm">
        <p className="font-medium">{title}</p>
        {children && <div className="mt-1 opacity-90">{children}</div>}
      </div>
    </div>
  );
}
