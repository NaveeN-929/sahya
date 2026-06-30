import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button
 * Variants map directly to brand intent, not arbitrary colors:
 *  - primary: main calls to action (e.g. "Start a conversation")
 *  - secondary: supportive actions (e.g. "Learn more")
 *  - outline: low-emphasis actions inside dense layouts
 *  - ghost: tertiary / icon-adjacent actions
 *  - emergency: reserved exclusively for crisis / urgent-help actions
 *  - destructive: reserved for irreversible actions (delete entry, end session)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-medium " +
    "transition-colors duration-fast ease-standard disabled:pointer-events-none disabled:opacity-45 " +
    "focus-visible:outline-none focus-visible:shadow-focus-ring",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
        secondary: "bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700",
        outline: "border border-border bg-surface text-ink hover:bg-muted",
        ghost: "text-ink hover:bg-muted",
        link: "text-link underline-offset-4 hover:underline",
        emergency: "bg-emergency text-white hover:bg-emergency-hover",
        destructive: "border border-error-border bg-error-bg text-error-fg hover:bg-error-border/40",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
