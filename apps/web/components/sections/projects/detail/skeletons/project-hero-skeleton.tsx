import { Skeleton } from '~/components/base/skeleton'

export function ProjectHeroSkeleton() {
	return (
		<div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
			<Skeleton className="h-64 md:h-80 lg:h-96 w-full" />
			<div className="p-6">
				<Skeleton className="h-10 w-3/4 mb-4" />
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-full mb-6" />

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
