import { forwardRef, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Bolt } from "lucide-react";
import { LearningPathCard } from "./learning-path-card";
import { StatsDisplay } from "./stats-display";
import { CTAButton } from "./cta-button";

const FeaturedLearningPaths = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => {
  const [learningPathsCount] = useState<number>(6);

  return (
    <Card ref={ref} className={`p-6 space-y-6 ${className}`} {...props}>
      <div className="flex items-center">
        <Badge className="bg-green-100 text-green-600 hover:bg-green-100">
          <Bolt className="mr-2 h-4 w-4" />
          Featured Learning Paths
        </Badge>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-foreground">Structured Learning</span>
          <span className="text-primary"> Journeys</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Follow our curated learning paths to master blockchain technologies in
          a structured, step-by-step approach.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="grid gap-6 md:grid-cols-2 lg:flex-1">
          <LearningPathCard
            icon="shield"
            title="Blockchain Fundamentals"
            description="6 modules • Beginner friendly"
            progress={50}
          />
          <LearningPathCard
            icon="bolt"
            title="Stellar Development"
            description="8 modules • Intermediate"
            progress={25}
          />
        </div>

        <div className="flex justify-center lg:justify-end">
          <StatsDisplay count={learningPathsCount} />
        </div>
      </div>

      <div className="flex justify-center">
        <CTAButton />
      </div>
    </Card>
  );
});

FeaturedLearningPaths.displayName = "FeaturedLearningPaths";
export { FeaturedLearningPaths };
