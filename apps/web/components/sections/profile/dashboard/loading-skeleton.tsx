import { Skeleton } from '~/components/base/skeleton'
import { cn } from '~/lib/utils'

interface LoadingSkeletonProps {
	/** Number of card-shaped skeleton rows to render */
	rows?: number
	className?: string
}

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
	return (
		<div className={cn('space-y-4', className)} aria-hidden="true">
			{Array.from({ length: rows }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
				<div key={i} className="flex gap-4 rounded-2xl border border-slate-100 bg-white/80 p-5">
					<Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-32 rounded" />
						<Skeleton className="h-3 w-full max-w-xs rounded" />
					</div>
				</div>
			))}
		</div>
	)
}

export function SectionLoadingSkeleton() {
	return (
		<div className="space-y-6" aria-hidden="true">
			<div className="space-y-2">
				<Skeleton className="h-6 w-40 rounded" />
				<Skeleton className="h-4 w-72 rounded" />
			</div>
			<LoadingSkeleton rows={4} />
		</div>
	)
}
