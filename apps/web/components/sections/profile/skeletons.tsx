import { Skeleton } from "~/components/base/skeleton";
import { SkeletonText } from "~/components/base/skeleton-text";

export function ProfileViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonText className="h-6 w-32" />
        <SkeletonText className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-slate-200 p-4"
          >
            <SkeletonText className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
