import { Skeleton } from '~/components/base/skeleton'

export function BreadcrumbSkeleton() {
	return (
		<div className="flex items-center gap-2 h-6 mb-4">
			<Skeleton className="h-4 w-4 rounded-full" />
			<Skeleton className="h-4 w-4" />
			<Skeleton className="h-4 w-16" />
			<Skeleton className="h-4 w-4" />
			<Skeleton className="h-4 w-24" />
			<Skeleton className="h-4 w-4" />
			<Skeleton className="h-4 w-32" />
		</div>
	)
}
