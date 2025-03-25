import React, { forwardRef } from "react"; // Importing React and forwardRef
import { Progress } from "@shadcn/ui"; // Importing Shadcn UI Progress component
import { Icon } from "lucide-react"; // Importing Lucide Icon component

interface LearningPathCardProps {
  icon: string; // Icon name for the learning path
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
          <Icon name={icon} /> {/* Updated to use Lucide Icon */}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>{" "}
          {/* Title of the learning path */}
          <p className="text-gray-500 text-base">{description}</p>{" "}
          {/* Description of the learning path */}
          <Progress
            value={progress}
            className="bg-gray-200 rounded-full h-2 mt-2 w-full"
          />{" "}
          {/* Updated to use Shadcn UI Progress component */}
        </div>
      </div>
    );
  }
);

LearningPathCard.displayName = "LearningPathCard";
export { LearningPathCard };
