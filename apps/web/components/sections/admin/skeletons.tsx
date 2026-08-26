import { Skeleton } from '~/components/base/skeleton'
import { SkeletonText } from '~/components/base/skeleton-text'
import { SectionContainer } from '~/components/shared/section-container'

export function AdminOverviewSkeleton() {
	return (
		<SectionContainer className="py-8">
			<div className="space-y-6">
				<div className="space-y-2">
					<SkeletonText className="h-8 w-48" />
					<SkeletonText className="h-4 w-96" />
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="space-y-2 rounded-lg border border-slate-200 p-4">
							<SkeletonText className="h-4 w-24" />
							<Skeleton className="h-8 w-full" />
						</div>
					))}
				</div>
				<div className="rounded-lg border border-slate-200 p-4">
					<div className="space-y-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<SkeletonText key={i} className="h-4 w-full" />
						))}
					</div>
				</div>
			</div>
		</SectionContainer>
	)
}

export function AdminGovernanceSkeleton() {
	return (
		<SectionContainer className="py-8">
			<div className="space-y-6">
				<div className="space-y-2">
					<SkeletonText className="h-8 w-48" />
					<SkeletonText className="h-4 w-96" />
				</div>
				<div className="rounded-lg border border-slate-200 p-4">
					<div className="space-y-3">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="flex items-center gap-3">
								<Skeleton className="h-4 w-4" />
								<SkeletonText className="h-4 flex-1" />
							</div>
						))}
					</div>
				</div>
			</div>
		</SectionContainer>
	)
}

export function AdminAnalyticsSkeleton() {
	return (
		<SectionContainer className="py-8">
			<div className="space-y-6">
				<div className="space-y-2">
					<SkeletonText className="h-8 w-48" />
					<SkeletonText className="h-4 w-96" />
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="rounded-lg border border-slate-200 p-4">
							<SkeletonText className="mb-2 h-4 w-24" />
							<Skeleton className="h-12 w-full" />
						</div>
					))}
				</div>
				<div className="rounded-lg border border-slate-200 p-4">
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		</SectionContainer>
	)
}

export function AdminGamificationSkeleton() {
	return (
		<SectionContainer className="py-8">
			<div className="space-y-6">
				<div className="space-y-2">
					<SkeletonText className="h-8 w-48" />
					<SkeletonText className="h-4 w-96" />
				</div>
				<div className="rounded-lg border border-slate-200 p-4">
					<div className="space-y-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="flex items-center justify-between">
								<SkeletonText className="h-4 w-32" />
								<Skeleton className="h-6 w-20" />
							</div>
						))}
					</div>
				</div>
			</div>
		</SectionContainer>
	)
}
