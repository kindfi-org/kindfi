import { Skeleton } from '~/components/base/skeleton'

export function ProjectTabsSkeleton() {
	return (
		<div>
			<div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
					<Skeleton key={i} className="h-10 flex-shrink-0" />
				))}
			</div>
			<div className="bg-white rounded-xl shadow-sm p-6">
				<Skeleton className="h-8 w-1/3 mb-6" />
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-3/4 mb-6" />

				<Skeleton className="h-8 w-1/3 mb-6" />
				<Skeleton className="h-80 w-full mb-6" />

				<Skeleton className="h-8 w-1/3 mb-6" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			</div>
		</div>
	)
}
