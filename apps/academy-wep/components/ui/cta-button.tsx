import { Button } from "@/components/ui/button";
import { forwardRef } from "react";

const CTAButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="flex justify-center md:justify-start">
      <Button
        ref={ref}
        className={`bg-gradient-to-r from-green-600 to-gray-900 hover:from-green-500 hover:to-green-700 shadow-lg ${className}`}
        size="lg"
        {...props}
      >
        Explore Learning Paths ➔
      </Button>
    </div>
  );
});

CTAButton.displayName = "CTAButton";
export { CTAButton };
