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
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
      outline:
        "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
      ghost: "hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      link: "text-blue-600 underline-offset-4 hover:underline focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
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
