import type { FC } from 'react'
import { Skeleton } from '~/components/base/skeleton'
import { cn } from '~/lib/utils'

interface SkeletonGridProps {
	count: number
	columns?: 1 | 2 | 3 | 4 | 5
	gap?: 3 | 4 | 6 | 8 | 12
	className?: string
	renderItem: (index: number) => React.ReactNode
}

const SkeletonGrid: FC<SkeletonGridProps> = ({
	count,
	columns = 3,
	gap = 8,
	className = '',
	renderItem,
}) => {
	const columnClasses = {
		2: 'sm:grid-cols-2',
		3: 'sm:grid-cols-2 lg:grid-cols-3',
		4: 'sm:grid-cols-2 lg:grid-cols-4',
		5: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
	}

	const gapClasses = {
		3: 'gap-3',
		4: 'gap-4',
		6: 'gap-6',
		8: 'gap-8',
		12: 'gap-12',
	}

	return (
		<div
			className={cn(
				'grid grid-cols-1',
				columnClasses[columns as 2 | 3 | 4 | 5],
				gapClasses[gap as 3 | 4 | 6 | 8 | 12],
				className,
			)}
		>
			{Array.from({ length: count }).map((_, index) => {
				const key = `skeleton-${index}`
				return <div key={key}>{renderItem(index)}</div>
			})}
		</div>
	)
}

export const SkeletonHero = () => (
	<section className="py-16">
		<div className="container">
			<div className="text-center space-y-8">
				<div className="inline-flex">
					<Skeleton className="h-8 w-40 rounded-full" />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-16 w-3/4 mx-auto" />
					<Skeleton className="h-6 w-1/2 mx-auto" />
				</div>
				<SkeletonGrid
					count={3}
					columns={3}
					gap={8}
					renderItem={() => (
						<div className="rounded-2xl bg-white p-8 shadow-lg">
							<Skeleton className="h-16 w-16 rounded-2xl" />
							<Skeleton className="mt-6 h-6 w-32" />
							<div className="mt-8 space-y-3">
								<div className="flex items-center justify-between">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-20" />
								</div>
								<Skeleton className="h-4 w-full" />
							</div>
						</div>
					)}
				/>
			</div>
		</div>
	</section>
)

export const SkeletonSuccessStories = () => (
	<section className="py-16">
		<div className="container">
			<div className="mb-12 text-center space-y-4">
				<Skeleton className="h-12 w-1/2 mx-auto" />
				<Skeleton className="h-6 w-2/3 mx-auto" />
			</div>
			<SkeletonGrid
				count={3}
				columns={3}
				gap={8}
				renderItem={() => (
					<div className="overflow-hidden rounded-2xl bg-white shadow-lg">
						<Skeleton className="aspect-video w-full" />
						<div className="p-6 space-y-4">
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-4" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-6 w-48" />
							<div className="space-y-2">
								<div className="flex justify-between">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-20" />
								</div>
								<Skeleton className="h-2 w-full" />
							</div>
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				)}
			/>
		</div>
	</section>
)

export const SkeletonCommunityVoices = () => (
	<section className="py-16 bg-gray-50">
		<div className="container">
			<div className="mb-12 text-center space-y-4">
				<Skeleton className="h-12 w-1/2 mx-auto" />
				<Skeleton className="h-6 w-2/3 mx-auto" />
			</div>
			<SkeletonGrid
				count={3}
				columns={3}
				gap={8}
				renderItem={() => (
					<div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-lg">
						<Skeleton className="h-20 w-20 rounded-full" />
						<div className="mt-4 text-center space-y-2">
							<Skeleton className="h-6 w-32 mx-auto" />
							<Skeleton className="h-4 w-40 mx-auto" />
						</div>
						<Skeleton className="mt-6 h-20 w-full" />
					</div>
				)}
			/>
		</div>
	</section>
)

export const SkeletonImpactMakers = () => (
	<section className="py-16">
		<div className="container">
			<div className="mb-12 text-center space-y-4">
				<Skeleton className="h-12 w-1/2 mx-auto" />
				<Skeleton className="h-6 w-2/3 mx-auto" />
			</div>
			<SkeletonGrid
				count={3}
				columns={3}
				gap={8}
				renderItem={() => (
					<div className="rounded-3xl bg-white p-8 shadow-lg">
						<div className="flex items-center gap-4">
							<Skeleton className="h-16 w-16 rounded-full" />
							<div>
								<Skeleton className="h-6 w-32" />
								<Skeleton className="mt-2 h-4 w-40" />
							</div>
						</div>
						<div className="mt-8 space-y-3">
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-20" />
							</div>
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-4 w-16" />
							</div>
						</div>
						<div className="mt-8 flex gap-2">
							<Skeleton className="h-8 w-32 rounded-full" />
							<Skeleton className="h-8 w-32 rounded-full" />
						</div>
					</div>
				)}
			/>
		</div>
	</section>
)

export const SkeletonImpactCategories = () => (
	<section className="py-16">
		<div className="container">
			<div className="mb-12 text-center space-y-4">
				<Skeleton className="h-12 w-1/2 mx-auto" />
				<Skeleton className="h-6 w-2/3 mx-auto" />
			</div>
			<SkeletonGrid
				count={4}
				columns={4}
				gap={8}
				renderItem={() => (
					<div className="rounded-3xl bg-white p-8 shadow-lg space-y-6">
						<div className="space-y-6">
							<Skeleton className="h-14 w-14 rounded-2xl" />
							<Skeleton className="h-6 w-32" />
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-20" />
							</div>
							<Skeleton className="h-1.5 w-full rounded-full" />
						</div>
						<div className="flex items-center justify-between">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-4 w-16" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-4" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
				)}
			/>
		</div>
	</section>
)

export const SkeletonMakeImpact = () => (
	<section className="py-24">
		<div className="container">
			<div className="mx-auto max-w-3xl text-center">
				<div className="space-y-8">
					<Skeleton className="h-12 w-1/2 mx-auto" />
					<Skeleton className="h-6 w-2/3 mx-auto" />
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Skeleton className="h-14 w-[200px] rounded-xl" />
						<Skeleton className="h-14 w-[200px] rounded-xl" />
					</div>
				</div>
			</div>
		</div>
	</section>
)
