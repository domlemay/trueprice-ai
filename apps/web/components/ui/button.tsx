"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // ── TruePriceAI v1.0 — cyan primary on navy ──
        default:
          "bg-tp-cyan-500 text-tp-navy-700 hover:bg-tp-cyan-600 hover:-translate-y-0.5 hover:shadow-tp-glow active:translate-y-0",
        outline:
          "border-2 border-tp-cyan-500/40 text-tp-cyan-500 hover:bg-tp-cyan-500/8 hover:border-tp-cyan-500",
        outlineNavy:
          "border-2 border-tp-navy-700 text-tp-navy-700 hover:bg-tp-navy-700 hover:text-white",
        ghost: "text-white/80 hover:bg-white/5 hover:text-white",
        link: "text-tp-cyan-500 underline-offset-4 hover:underline",
        navy:
          "bg-tp-navy-600 text-white hover:bg-tp-navy-500 hover:-translate-y-0.5 hover:shadow-tp-md",
        // Aliases legacy — pointent vers les nouveaux variants
        secondary:
          "border-2 border-tp-cyan-500/40 text-tp-cyan-500 hover:bg-tp-cyan-500/8",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
