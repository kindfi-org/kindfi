import React, { useState, useEffect, forwardRef } from "react"; // Importing React, hooks, and forwardRef
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faBolt, faShieldAlt } from "@fortawesome/free-solid-svg-icons"; // Import specific icons
import { LearningPathCard } from "./LearningPathCard"; // Use named import
import { StatsDisplay } from "./StatsDisplay"; // Use named import
import { CTAButton } from "./CTAButton"; // Use named import

const FeaturedLearningPaths = forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>((props, ref) => {
  const [learningPathsCount, setLearningPathsCount] = useState<number>(6); // Initial count of learning paths

  const className = props.className || "";

  useEffect(() => {
    setTimeout(() => {
      setLearningPathsCount(6);
    }, 2000);
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-gray-50 rounded-lg shadow-lg p-4 md:p-6 mx-auto ${className}`}
    >
      {/* Container for featured learning paths */}
      <div className="flex items-center mb-4">
        <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
          <FontAwesomeIcon icon={faBolt} className="mr-2" /> Featured Learning
          Paths
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl mb-2">
        {/* Main title for featured learning paths */}
        <span className="font-bold text-gray-900">Structured Learning</span>
        <span className="font-bold text-green-700"> Journeys</span>
      </h1>
      <p className="text-gray-600 mb-6 text-lg md:text-xl">
        Follow our curated learning paths to master blockchain technologies in a
        structured, step-by-step approach.
      </p>
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 p-2">
        {/* Layout for learning path cards and stats */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6 md:w-full">
          <LearningPathCard
            icon={<FontAwesomeIcon icon={faShieldAlt} />}
            title="Blockchain Fundamentals"
            description="6 modules • Beginner friendly"
            progress={50}
          />
          <LearningPathCard
            icon={<FontAwesomeIcon icon={faBolt} />}
            title="Stellar Development"
            description="8 modules • Intermediate"
            progress={25}
          />
        </div>
        <div className="flex justify-center md:w-1/4">
          {/* Container for stats display */}
          <StatsDisplay count={learningPathsCount} />
        </div>
      </div>
      <div className="mt-6 text-center">
        {/* Container for the explore button */}
        <CTAButton />
      </div>
    </div>
  );
});

FeaturedLearningPaths.displayName = "FeaturedLearningPaths";
export { FeaturedLearningPaths };
