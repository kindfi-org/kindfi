import { memo } from 'react'
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Skeleton } from '~/components/base/skeleton'

function MetricCardSkeletonImpl() {
	return (
		<Card className="@container/card" aria-hidden="true" data-loading="true">
			<CardHeader className="relative">
				<CardDescription>
					<Skeleton className="h-4 w-20" />
				</CardDescription>
				<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
					<Skeleton className="h-8 w-24" />
				</CardTitle>
				<div className="absolute right-4 top-4">
					<Skeleton className="h-6 w-12 rounded-lg" />
				</div>
			</CardHeader>
			<CardFooter className="flex-col items-start gap-1 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					<Skeleton className="size-4 rounded" />
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="text-muted-foreground">
					<Skeleton className="h-3 w-32" />
				</div>
			</CardFooter>
		</Card>
	)
}

export const MetricCardSkeleton = memo(MetricCardSkeletonImpl)
MetricCardSkeleton.displayName = 'MetricCardSkeleton'
