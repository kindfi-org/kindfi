import React, { forwardRef } from "react"; // Importing React and forwardRef
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faUserCircle } from "@fortawesome/free-solid-svg-icons"; // Import specific icon

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
        <FontAwesomeIcon icon={faUserCircle} className="text-5xl" />{" "}
        {/* Icon for stats display */}
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
