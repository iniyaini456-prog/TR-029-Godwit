import * as React from "react";
import { cn } from "./utils";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<ButtonVariant, string> = {
      default:
        "bg-[var(--accent)] text-[var(--ink)] hover:bg-[#eb850f] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2",
      destructive:
        "bg-[var(--danger)] text-[var(--ink)] hover:bg-[#dc2626] focus:ring-2 focus:ring-[var(--danger)] focus:ring-offset-2",
      outline:
        "border border-[var(--border)] bg-[var(--card-bg)] text-[var(--ink)] hover:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--info)] focus:ring-offset-2",
      secondary:
        "bg-[var(--surface)] text-[var(--ink)] hover:bg-[#1f2d43] focus:ring-2 focus:ring-[var(--info)] focus:ring-offset-2",
      ghost: "hover:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2",
      link: "text-[var(--info)] underline-offset-4 hover:underline focus:ring-2 focus:ring-[var(--info)] focus:ring-offset-2",
    };

    const sizes: Record<ButtonSize, string> = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 rounded px-3 text-xs",
      lg: "h-10 rounded px-6 text-base",
      icon: "h-9 w-9 rounded p-0",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
