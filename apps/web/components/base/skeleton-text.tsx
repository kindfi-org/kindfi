import type { FC } from 'react'
import { Skeleton } from '~/components/base/skeleton'
import { cn } from '~/lib/utils'

interface SkeletonTextProps {
	width: number[]
	className?: string
}

export const SkeletonText: FC<SkeletonTextProps> = ({ width, className }) => {
	return (
		<div className="space-y-2">
			{width.map((w) => (
				<Skeleton
					key={w}
					className={cn('h-4', className)}
					style={{ width: `${w}%` }}
				/>
			))}
		</div>
	)
}
