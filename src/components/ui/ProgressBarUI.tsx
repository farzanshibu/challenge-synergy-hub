
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  indicator?: boolean;
  showPercentage?: boolean;
  variant?: "default" | "success" | "info" | "warning" | "danger";
}

const ProgressBarUI = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    indicator = true, 
    showPercentage = true,
    variant = "default",
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
    
    // Color variants
    const variantClasses = {
      default: "bg-accent",
      success: "bg-challenge-success",
      info: "bg-challenge-secondary",
      warning: "bg-challenge-warning",
      danger: "bg-challenge"
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
            "h-full w-full flex-1 transition-all duration-300 ease-in-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
        
        {indicator && (
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-end pr-2",
              percentage < 10 && "justify-start pl-2"
            )}
          >
            {showPercentage && (
              <span 
                className={cn(
                  "text-xs font-medium",
                  percentage > 30 ? "text-white" : "text-zinc-200" 
                )}
              >
                {value} / {max}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

ProgressBarUI.displayName = "ProgressBarUI";

export { ProgressBarUI };
