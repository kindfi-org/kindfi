import React, { forwardRef } from "react"; // Importing React and forwardRef
import { Icon } from "@shadcn/ui"; // Import Shadcn UI Icon component

interface StatsDisplayProps {
  count: number; // Count of learning paths
}

const StatsDisplay = forwardRef<HTMLDivElement, StatsDisplayProps>(
  ({ count }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white text-green-600 rounded-full p-6 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out w-40 h-40"
      >
        {/* Stats display container */}
        <Icon name="user-circle" className="text-5xl" />{" "}
        {/* Updated to use Shadcn UI Icon */}
        <span className="text-2xl font-semibold mt-2 whitespace-nowrap">
          {count}+
        </span>
        <span className="text-gray-500 text-sm whitespace-nowrap">
          {/* Label for the count */}
          Learning Paths
        </span>
      </div>
    );
  }
);

StatsDisplay.displayName = "StatsDisplay";
export { StatsDisplay };
