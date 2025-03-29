import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils"; // Your class merging utility

const progressBarVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 rounded-full",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        destructive: "bg-red-500",
        accent: "bg-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  value: number; // 0-100
  showLabel?: boolean;
  labelPosition?: "inside" | "outside";
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      size,
      variant,
      value = 0,
      showLabel = false,
      labelPosition = "outside",
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div className="w-full space-y-1">
        {showLabel && labelPosition === "outside" && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{clampedValue}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressBarVariants({ size, className }))}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          {...props}
        >
          <div
            className={cn(progressIndicatorVariants({ variant }))}
            style={{ width: `${clampedValue}%` }}
          >
            {showLabel && labelPosition === "inside" && (
              <span className="absolute right-2 text-xs text-white mix-blend-difference">
                {clampedValue}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar, progressBarVariants, progressIndicatorVariants };
