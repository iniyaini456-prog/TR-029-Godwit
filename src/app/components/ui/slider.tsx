import * as React from "react";
import { cn } from "./utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 outline-none accent-blue-600",
        className
      )}
      {...props}
    />
  )
);
Slider.displayName = "Slider";

export { Slider };
