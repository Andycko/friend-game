import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "accent";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variant === "default" && "bg-zinc-900 text-white",
        variant === "secondary" && "bg-zinc-100 text-zinc-700",
        variant === "outline" && "border border-zinc-300 text-zinc-700",
        variant === "accent" && "bg-violet-100 text-violet-700",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
