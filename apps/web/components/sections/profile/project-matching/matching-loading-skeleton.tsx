'use client'

import { ProfileSurfaceCard } from '../profile-surface-card'

const SKELETON_COUNT = 3

export const MatchingLoadingSkeleton = () => {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
			{Array.from({ length: SKELETON_COUNT }, (_, index) => (
				<ProfileSurfaceCard
					key={`matching-skeleton-${index}`}
					padding="sm"
					className="overflow-hidden p-0"
				>
					<div className="h-40 animate-pulse bg-muted" />
					<div className="space-y-3 p-5">
						<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-3 w-1/2 animate-pulse rounded bg-muted/80" />
						<div className="space-y-2">
							<div className="h-3 w-full animate-pulse rounded bg-muted/70" />
							<div className="h-3 w-5/6 animate-pulse rounded bg-muted/70" />
						</div>
						<div className="h-2 w-full animate-pulse rounded-full bg-muted" />
						<div className="h-9 w-full animate-pulse rounded-full bg-muted" />
					</div>
				</ProfileSurfaceCard>
			))}
		</div>
	)
}
