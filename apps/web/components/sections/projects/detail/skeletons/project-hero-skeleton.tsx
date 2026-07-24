import { Skeleton } from '~/components/base/skeleton'

export function ProjectHeroSkeleton() {
	return (
		<div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
			<Skeleton className="h-96 w-full rounded-none sm:h-112 md:h-128 lg:h-144" />
			<div className="relative -mt-8 rounded-t-3xl bg-white px-5 pb-6 pt-7 sm:px-6 md:-mt-10 md:px-8 md:pb-8 md:pt-9">
				<Skeleton className="mb-3 h-10 w-3/4" />
				<Skeleton className="mb-2 h-4 w-full" />
				<Skeleton className="mb-6 h-4 w-5/6" />

				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					<Skeleton className="h-8 w-40 rounded-full" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
				</div>

				<Skeleton className="mb-6 h-28 w-full rounded-2xl" />

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
					<Skeleton className="h-20 w-full rounded-xl" />
					<Skeleton className="h-20 w-full rounded-xl" />
					<Skeleton className="h-20 w-full rounded-xl" />
					<Skeleton className="h-20 w-full rounded-xl" />
					<Skeleton className="col-span-2 h-20 w-full rounded-xl sm:col-span-1" />
				</div>

				<div className="mt-6 border-t border-slate-100 pt-6">
					<Skeleton className="mb-3 h-4 w-36" />
					<Skeleton className="h-10 w-full rounded-full" />
				</div>
			</div>
		</div>
	)
}
