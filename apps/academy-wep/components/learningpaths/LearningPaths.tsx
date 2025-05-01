import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LearningPathCardProps, LearningPathsCard } from "./LearningPathCard";
import LoadingCard from "./loading-card";
import { LEARNING_PATHS } from "~/lib/utils/learning-paths-utils";
import { ErrorFallback } from "./error-fallback";

const LearningPaths = ({ loadingDelay = 1500 }: { loadingDelay?: number }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), loadingDelay);
    return () => clearTimeout(timeout);
  }, [loadingDelay]);

  return (
    <div className="p-8 bg-white lg:p-14">
      <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-end">
        <div>
          <div className="px-3 py-1 bg-[#f0f9e8] text-[#7CC635] rounded-full text-sm font-medium mb-4 w-fit">
            <span>Learning Paths</span>
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-[#7CC635] bg-clip-text text-transparent">
            Choose Your Learning Journey
          </h2>
        </div>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-md w-fit"
          aria-label="View All Learning Paths"
          onClick={() => router.push("/learn")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/learn");
            }
          }}
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
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {LEARNING_PATHS.map((path: LearningPathCardProps) => (
              <LearningPathsCard
                key={path.cta}
                icon={path.icon}
                title={path.title}
                description={path.description}
                modules={path.modules}
                level={path.level}
                duration={path.duration}
                cta={path.cta}
                ctaColor={path.ctaColor}
              />
            ))}
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};

export default LearningPaths;
