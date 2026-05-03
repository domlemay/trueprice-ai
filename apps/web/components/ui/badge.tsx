import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:  "border-transparent bg-tp-cyan-500 text-tp-navy-700",
        secondary: "border-transparent bg-tp-navy-600 text-white",
        outline:  "border-tp-cyan-500/40 text-tp-cyan-500 bg-transparent",
        success:  "border-transparent bg-tp-success/20 text-tp-success",
        warning:  "border-transparent bg-tp-warning/20 text-tp-warning",
        error:    "border-transparent bg-tp-error/20 text-tp-error",
        ghost:    "border-tp-cyan-500/20 bg-tp-cyan-500/10 text-tp-cyan-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
