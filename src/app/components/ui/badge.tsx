import * as React from "react";
import { cn } from "./utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-[rgba(59,130,246,0.15)] text-[var(--info)] border-[rgba(59,130,246,0.25)]",
    secondary: "bg-[var(--card-bg)] text-[var(--ink)] border-[var(--border)]",
    destructive: "bg-[rgba(239,68,68,0.15)] text-[var(--danger)] border-[rgba(239,68,68,0.25)]",
    outline: "bg-transparent text-[var(--ink)] border-[var(--border)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
