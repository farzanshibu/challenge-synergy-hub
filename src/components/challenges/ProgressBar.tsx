
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProgressBarUI } from '@/components/ui/ProgressBarUI';

interface ProgressBarProps {
  title: string;
  currentValue: number;
  maxValue: number;
  minValue?: number;
  endDate?: Date;
  className?: string;
  showTitle?: boolean;
  variant?: "default" | "success" | "info" | "warning" | "danger";
}

export default function ProgressBar({
  title,
  currentValue,
  maxValue,
  minValue = 0,
  endDate,
  className,
  showTitle = true,
  variant = "default"
}: ProgressBarProps) {
  // Calculate progress percentage
  const progress = Math.min(Math.max(0, (currentValue / maxValue) * 100), 100);
  
  // Determine variant based on progress
  let autoVariant: "default" | "success" | "info" | "warning" | "danger" = "default";
  if (variant === "default") {
    if (progress >= 100) {
      autoVariant = "success";
    } else if (progress >= 75) {
      autoVariant = "info";
    } else if (progress >= 50) {
      autoVariant = "warning";
    } else {
      autoVariant = "danger";
    }
  } else {
    autoVariant = variant;
  }
  
  // Format end date
  const formattedEndDate = endDate ? format(new Date(endDate), 'PPP') : undefined;
  
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {showTitle && (
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-white">{title}</h3>
          {formattedEndDate && (
            <div className="px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-300">
              Ends: {formattedEndDate}
            </div>
          )}
        </div>
      )}
      
      <ProgressBarUI 
        value={currentValue} 
        max={maxValue} 
        variant={autoVariant}
        className="h-6"
      />
    </div>
  );
}
