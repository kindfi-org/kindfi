export function FoundationDetailSkeleton() {
	return (
		<div className="space-y-12">
			<div className="space-y-5">
				<div className="h-4 w-36 animate-pulse rounded bg-slate-200/80" />
				<div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
					<div className="h-72 w-full animate-pulse bg-slate-200/70 sm:h-80 md:h-96" />
					<div className="relative space-y-5 px-5 pb-7 pt-16 sm:px-7 sm:pt-20 md:px-9 md:pt-24">
						<div className="absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-2xl border-4 border-white bg-slate-200 shadow-xl sm:h-32 sm:w-32 md:left-9 md:translate-x-0" />
						<div className="space-y-3 md:pl-44 lg:pl-48">
							<div className="mx-auto h-3 w-28 animate-pulse rounded bg-slate-200/80 md:mx-0" />
							<div className="mx-auto h-10 w-3/4 animate-pulse rounded-lg bg-slate-200/80 md:mx-0" />
						</div>
						<div className="h-16 w-full animate-pulse rounded bg-slate-100" />
						<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={`skeleton-stat-${i}`}
									className="h-20 animate-pulse rounded-2xl bg-slate-100"
								/>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className="grid gap-5 md:grid-cols-2">
				<div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
				<div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
			</div>
		</div>
	)
}
