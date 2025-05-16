import { Skeleton } from '~/components/base/skeleton'

export function ProjectCardListSkeleton() {
	return (
		<div className="w-full bg-white rounded-lg shadow-md overflow-hidden flex flex-row">
			<Skeleton className="w-1/4 min-w-[120px] max-w-[180px] h-full" />
			<div className="p-5 flex flex-col flex-grow space-y-3">
				<Skeleton className="h-5 w-1/2" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-2 w-full rounded-full" />
				<div className="flex justify-between">
					<Skeleton className="h-4 w-20" />
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
