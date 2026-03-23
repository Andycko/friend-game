import * as React from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  "bg-rose-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const color = getAvatarColor(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold text-white shrink-0",
        color,
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-11 w-11 text-sm",
        size === "lg" && "h-16 w-16 text-xl",
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
