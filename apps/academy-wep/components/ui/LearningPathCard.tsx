import React, { forwardRef } from "react"; // Importing React and forwardRef
import ProgressBar from "react-progressbar"; // Importing ProgressBar

interface LearningPathCardProps {
  icon: React.ReactNode; // Icon for the learning path
  title: string;
  description: string;
  progress: number;
}

const LearningPathCard = forwardRef<HTMLDivElement, LearningPathCardProps>(
  ({ icon, title, description, progress }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white border border-gray-200 rounded-lg p-4 flex items-center space-x-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:scale-105 md:w-1/2"
      >
        {/* Card container */}
        <div className="bg-green-100 text-green-600 p-3 rounded-full text-xl">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>{" "}
          {/* Title of the learning path */}
          <p className="text-gray-500 text-base">{description}</p>{" "}
          {/* Description of the learning path */}
          <ProgressBar
            completed={progress}
            className="bg-gray-200 rounded-full h-2 mt-2 w-full"
            bgcolor="green"
          />{" "}
          {/* Progress bar for the learning path */}
        </div>
      </div>
    );
  }
);

LearningPathCard.displayName = "LearningPathCard";
export { LearningPathCard };
