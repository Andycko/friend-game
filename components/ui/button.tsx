import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 text-white shadow hover:bg-zinc-800",
        outline:
          "border-2 border-zinc-900 bg-transparent text-zinc-900 hover:bg-zinc-100",
        ghost: "hover:bg-zinc-100 text-zinc-900",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
        accent: "bg-violet-600 text-white hover:bg-violet-700",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
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
