"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LEARNING_PATHS } from "~/lib/utils/learning-paths-utils";
// Internal imports
import { LearningPathsCard } from "./LearningPathCard";
import type { LearningPathCardProps } from "./LearningPathCard";
import { ErrorFallback } from "./error-fallback";
import { LoadingCard } from "./loading-card";

const DEFAULT_LOADING_DELAY = 1500;

const LearningPaths = ({
  loadingDelay = DEFAULT_LOADING_DELAY,
}: {
  loadingDelay?: number;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleNavigate = () => router.push("/learn");

  useLayoutEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), loadingDelay);
    return () => clearTimeout(timeout);
  }, [loadingDelay]);

  return (
    <div className="p-8 bg-white lg:p-14">
      <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-end">
        <div>
          <div
            className="px-3 py-1 bg-[#f0f9e8] text-[#7CC635] rounded-full text-sm font-medium mb-4 w-fit"
            role="note"
            aria-label="Section type"
          >
            <span>Learning Paths</span>
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-[#7CC635] bg-clip-text text-transparent">
            Choose Your Learning Journey
          </h2>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-md w-fit focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="View All Learning Paths"
          title="Navigate to all learning paths"
          onClick={handleNavigate}
        >
          <span>View All Paths</span>
          <ArrowRight className="h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6 lg:flex-row">
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          {LEARNING_PATHS.map((learningPath: LearningPathCardProps) => (
            <ErrorBoundary
              key={learningPath.cta}
              FallbackComponent={ErrorFallback}
            >
              <LearningPathsCard {...learningPath} />
            </ErrorBoundary>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPaths;
