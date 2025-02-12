import type { FC } from 'react'
import { Skeleton } from '~/components/base/skeleton'

interface SkeletonTextProps {
	width: number[]
}

export const SkeletonText: FC<SkeletonTextProps> = ({ width }) => {
	return (
		<div className="space-y-2">
			{width.map((w) => (
				<Skeleton key={w} className={`h-4 w-[${w}%]`} />
			))}
		</div>
	)
}
