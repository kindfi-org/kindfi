import React, { useState, useEffect } from "react";
import LearningPathCard from "./LearningPathCard";
import StatsDisplay from "./StatsDisplay";
import CTAButton from "./CTAButton";

const FeaturedLearningPaths: React.FC = () => {
  const [learningPathsCount, setLearningPathsCount] = useState<number>(6);

  useEffect(() => {
    setTimeout(() => {
      setLearningPathsCount(6);
    }, 2000);
  }, []);

  return (
    <div className="bg-gray-50 rounded-lg shadow-lg p-4 md:p-6 mx-auto">
      <div className="flex items-center mb-4">
        <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
          <i className="fas fa-bolt mr-2"></i> Featured Learning Paths
        </span>
      </div>

      <h1 className="text-3xl md:text-4xl mb-2">
        <span className="font-bold text-gray-900">Structured Learning</span>
        <span className="font-bold text-green-700"> Journeys</span>
      </h1>
      <p className="text-gray-600 mb-6 text-lg md:text-xl">
        Follow our curated learning paths to master blockchain technologies in a
        structured, step-by-step approach.
      </p>

      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 p-2">
        {/* Left Section: Learning Path Cards */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6 md:w-full">
          <LearningPathCard
            icon={<i className="fas fa-shield-alt"></i>}
            title="Blockchain Fundamentals"
            description="6 modules • Beginner friendly"
            progress={50}
          />
          <LearningPathCard
            icon={<i className="fas fa-bolt"></i>}
            title="Stellar Development"
            description="8 modules • Intermediate"
            progress={25}
          />
        </div>

        {/* Right Section: Learning Paths Count */}
        <div className="flex justify-center md:w-1/4">
          <StatsDisplay count={learningPathsCount} />
        </div>
      </div>

      {/* Explore Button */}
      <div className="mt-6 text-center">
        <CTAButton />
      </div>
    </div>
  );
};

export default FeaturedLearningPaths;
