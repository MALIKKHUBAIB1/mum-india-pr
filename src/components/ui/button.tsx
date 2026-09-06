import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-secondary hover:text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/70",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* Brand variants */
        accent:
          "bg-accent text-accent-foreground shadow-[var(--shadow-accent)] hover:bg-saffron-deep hover:-translate-y-0.5",
        navy: "bg-navy text-primary-foreground shadow-[var(--shadow-card)] hover:bg-navy-deep hover:-translate-y-0.5",
        outlineAccent:
          "border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-accent-foreground",
        green:
          "bg-india-green text-primary-foreground shadow-[var(--shadow-card)] hover:bg-india-green-deep hover:-translate-y-0.5",
        outlineGreen:
          "border-2 border-india-green text-india-green-deep bg-transparent hover:bg-india-green hover:text-primary-foreground",
        onDark:
          "border border-white/30 bg-white/5 text-primary-foreground hover:bg-white/15 backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-7 text-[0.95rem]",
        xl: "h-14 rounded-md px-9 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
