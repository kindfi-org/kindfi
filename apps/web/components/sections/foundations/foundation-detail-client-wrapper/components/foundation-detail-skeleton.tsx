export function FoundationDetailSkeleton() {
	return (
		<div className="space-y-8">
			<div className="relative h-64 w-full animate-pulse overflow-hidden rounded-2xl border border-slate-200/80 bg-white md:h-96" />
			<div className="space-y-6">
				<div className="h-12 w-1/2 animate-pulse rounded-lg bg-muted" />
				<div className="h-6 w-2/3 animate-pulse rounded-lg bg-muted" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={`skeleton-${i}`}
							className="h-24 animate-pulse rounded-xl border border-slate-200/80 bg-white"
						/>
					))}
				</div>
			</div>
		</div>
	)
}
