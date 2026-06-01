const SKELETON_KEYS = ['admin-sk-1', 'admin-sk-2', 'admin-sk-3', 'admin-sk-4'] as const

export function AdminOverviewSkeleton() {
	return (
		<div className="space-y-6" aria-live="polite" aria-busy="true">
			<p className="text-muted-foreground">Loading…</p>
			<div className="h-8 bg-muted animate-pulse rounded w-1/3" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{SKELETON_KEYS.map((key) => (
					<div
						key={key}
						className="h-32 bg-muted animate-pulse rounded-lg"
					/>
				))}
			</div>
		</div>
	)
}
