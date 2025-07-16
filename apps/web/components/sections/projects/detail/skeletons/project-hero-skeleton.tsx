import { Skeleton } from '~/components/base/skeleton'

export function ProjectHeroSkeleton() {
	return (
		<div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
			<Skeleton className="h-64 md:h-80 lg:h-96 w-full" />
			<div className="p-6">
				<Skeleton className="h-10 w-3/4 mb-3" />
				<Skeleton className="h-4 w-full mb-6" />

				<div className="flex flex-wrap items-center justify-between mb-6 gap-2">
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-6 rounded-full" />
						<Skeleton className="h-4 w-24" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			</div>
		</div>
	)
}
