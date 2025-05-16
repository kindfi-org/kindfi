import { Skeleton } from '~/components/base/skeleton'

export function ProjectCardGridSkeleton() {
	return (
		<div className="min-w-[280px] sm:min-w-[300px] md:min-w-[340px] bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
			<Skeleton className="h-48 w-full" />
			<div className="p-5 space-y-3 flex flex-col flex-grow">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-2 w-full rounded-full" />
				<div className="flex justify-between text-sm text-gray-500">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-10" />
				</div>
				<div className="grid grid-cols-3 gap-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-5 w-14 rounded" />
					<Skeleton className="h-5 w-10 rounded" />
				</div>
			</div>
		</div>
	)
}
