import { Skeleton } from '~/components/base/skeleton'

export function FoundationCardGridSkeleton() {
	return (
		<div className="flex h-full min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
			<Skeleton className="h-40 w-full rounded-none" />
			<div className="flex flex-grow flex-col p-6">
				<div className="-mt-12 mb-4 flex justify-center">
					<Skeleton className="h-28 w-28 rounded-2xl" />
				</div>
				<Skeleton className="mx-auto mb-2 h-6 w-3/4" />
				<Skeleton className="mx-auto mb-6 h-4 w-full" />
				<div className="mb-6 grid grid-cols-3 gap-4 border-b border-slate-100 pb-6">
					<Skeleton className="mx-auto h-10 w-12" />
					<Skeleton className="mx-auto h-10 w-12" />
					<Skeleton className="mx-auto h-10 w-12" />
				</div>
				<Skeleton className="mt-auto h-8 w-full" />
			</div>
		</div>
	)
}
