import { Skeleton } from '~/components/base/skeleton'

export function ProjectSidebarSkeleton() {
	return (
		<div className="bg-white rounded-xl shadow-md overflow-hidden">
			<div className="p-6">
				<Skeleton className="h-8 w-1/2 mb-4" />
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-full mb-6" />

				<Skeleton className="h-8 w-1/3 mb-4" />
				<Skeleton className="h-12 w-full mb-4" />
				<Skeleton className="h-10 w-full mb-4" />

				<div className="flex gap-4">
					<Skeleton className="h-10 w-1/2" />
					<Skeleton className="h-10 w-1/2" />
				</div>
			</div>

			<div className="bg-gray-50 p-6 border-t border-gray-200">
				<Skeleton className="h-6 w-1/3 mb-2" />
				<div className="flex flex-wrap gap-2">
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-8 w-24" />
				</div>
			</div>
		</div>
	)
}
