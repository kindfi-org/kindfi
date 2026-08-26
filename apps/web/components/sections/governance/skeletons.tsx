import { Skeleton } from '~/components/base/skeleton'

export function GovernanceSkeleton() {
	return (
		<div className="container mx-auto space-y-8 px-4 py-12">
			<div className="space-y-3 text-center">
				<Skeleton className="mx-auto h-10 w-72" />
				<Skeleton className="mx-auto h-5 w-96 max-w-full" />
			</div>
			<Skeleton className="mx-auto h-24 w-full max-w-md rounded-2xl" />
			<div className="space-y-4">
				<Skeleton className="h-10 w-64 rounded-full" />
				<Skeleton className="h-48 w-full rounded-xl" />
				<Skeleton className="h-48 w-full rounded-xl" />
			</div>
		</div>
	)
}
