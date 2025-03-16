import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  indicator?: boolean;
  showPercentage?: boolean;
  variant?: "default" | "success" | "info" | "warning" | "danger";
}

const ProgressBarUI = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      indicator = true,
      showPercentage = true,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    // Color variants
    const variantClasses = {
      default: "bg-accent",
      success: "bg-challenge-success",
      info: "bg-challenge-secondary",
      warning: "bg-challenge-warning",
      danger: "bg-challenge",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-zinc-800",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />

        {indicator && showPercentage && (
          // This container positions three segments:
          // Left: "0 |", Center: current value, Right: "| max"
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-zinc-200">0</span>
            </div>
            <span
              className={cn(
                "text-xs font-medium animate-wiggle",
                value > max * 0.3 ? "text-white" : "text-zinc-200"
              )}
            >
              {value}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-zinc-200">{max}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ProgressBarUI.displayName = "ProgressBarUI";

export { ProgressBarUI };
