import type { FC } from 'react'
import { Skeleton } from '~/components/base/skeleton'
import { SkeletonText } from '~/components/base/skeleton-text'

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
			className={`grid grid-cols-1 ${columnClasses[columns as 2 | 3 | 4 | 5]} ${gapClasses[gap as 3 | 4 | 6 | 8 | 12]} ${className}`}
		>
			{Array.from({ length: count }).map(() => {
				const key = `skeleton-${Math.random().toString(36).substr(2, 9)}`
				return <div key={key}>{renderItem(Math.random())}</div>
			})}
		</div>
	)
}

export const SkeletonHero = () => (
	<section
		className="relative z-0 min-h-[100vh] bg-gradient-to-b from-purple-50/50 to-white px-4 py-20"
		aria-labelledby="hero-title"
		role="banner"
	>
		<div className="container mx-auto max-w-6xl">
			<div className="text-center space-y-6">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<Skeleton className="h-12 w-3/4 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto" />
				<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
					<Skeleton className="h-12 w-1/2" />
					<Skeleton className="h-12 w-1/2" />
				</div>
				<div className="flex flex-wrap justify-center gap-3 mb-6">
					<SkeletonGrid
						count={5}
						columns={5}
						gap={3}
						renderItem={() => <Skeleton className="h-10 w-24" />}
					/>
				</div>
			</div>
		</div>
	</section>
)

export const SkeletonUserJourney = () => (
	<section className="gradient-bg-blue-purple relative overflow-hidden px-4 py-14 min-h-[100vh]">
		<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

		<div className="relative mx-auto max-w-7xl">
			<div className="text-center mb-16 space-y-4">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90]} className="mx-auto" />
			</div>

			<div className="mt-12 mb-16 flex justify-center space-x-4">
				<Skeleton className="h-10 w-32 rounded-full" />
				<Skeleton className="h-10 w-32 rounded-full" />
			</div>

			<SkeletonGrid
				count={5}
				columns={5}
				gap={4}
				renderItem={() => (
					<div className="space-y-4">
						<Skeleton className="h-8 w-8 mx-auto" />
						<Skeleton className="h-6 w-3/4 mx-auto" />
						<SkeletonText width={[100, 90, 80]} className="mx-auto" />
					</div>
				)}
			/>

			<div className="mt-12 text-center">
				<Skeleton className="h-12 w-48 mx-auto" />
			</div>
		</div>
	</section>
)

export const SkeletonHighlightedProjects = () => (
	<section className="w-full px-4 py-10 sm:px-6 lg:px-8">
		<div className="mx-auto max-w-[1400px]">
			<div className="text-center mb-8">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto mt-4" />
			</div>

			<div className="relative">
				<div className="flex overflow-hidden -ml-2 md:-ml-4">
					<SkeletonGrid
						count={4}
						columns={4}
						gap={4}
						className="pl-2 md:pl-4"
						renderItem={() => (
							<div className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
								<Skeleton className="h-40 w-full" />
							</div>
						)}
					/>
				</div>
			</div>

			<div className="mt-12 flex justify-center">
				<Skeleton className="h-12 w-48 mx-2" />
				<Skeleton className="h-12 w-48 mx-2" />
			</div>
		</div>
	</section>
)

export const SkeletonJoinUs = () => (
	<section className="relative py-24 overflow-hidden">
		<div className="absolute inset-0">
			<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
		</div>

		<div className="relative container mx-auto px-4">
			<div className="text-center mb-16 space-y-4">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto" />
			</div>

			<SkeletonGrid
				count={3}
				columns={3}
				gap={8}
				className="mb-16"
				renderItem={() => (
					<div className="space-y-4">
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-6 w-3/4 mx-auto" />
						<SkeletonText width={[100, 90, 80]} className="mx-auto" />
						<Skeleton className="h-6 w-1/2 mx-auto" />
					</div>
				)}
			/>

			<div className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-lg max-w-3xl mx-auto overflow-hidden">
				<div className="relative space-y-4">
					<Skeleton className="h-8 w-1/2 mx-auto" />
					<SkeletonText width={[100, 90, 80]} className="mx-auto" />
					<div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
						<Skeleton className="h-12 w-48 mx-2" />
						<Skeleton className="h-12 w-48 mx-2" />
					</div>
				</div>
			</div>
		</div>
	</section>
)

export const SkeletonHowItWorks = () => (
	<section className="w-full px-4 py-20 sm:px-6 lg:px-8">
		<div className="mx-auto max-w-7xl">
			<div className="text-center mb-16 space-y-4">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto" />
			</div>

			<SkeletonGrid
				count={3}
				columns={3}
				gap={8}
				renderItem={() => (
					<div className="space-y-4">
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-6 w-3/4 mx-auto" />
						<SkeletonText width={[100, 90, 80]} className="mx-auto" />
					</div>
				)}
			/>
		</div>
	</section>
)

export const SkeletonNewUserGuide = () => (
	<section className="relative py-24 overflow-hidden">
		<div className="absolute inset-0 gradient-bg-blue-purple">
			<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
		</div>

		<div className="relative container mx-auto px-4">
			<div className="text-center mb-20 space-y-4">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto" />
			</div>

			<div className="max-w-4xl mx-auto space-y-20">
				<SkeletonGrid
					count={3}
					columns={1}
					gap={8}
					renderItem={() => (
						<div className="space-y-4">
							<Skeleton className="h-40 w-full" />
							<Skeleton className="h-6 w-3/4 mx-auto" />
							<SkeletonText width={[100, 90, 80]} className="mx-auto" />
						</div>
					)}
				/>
			</div>
		</div>
	</section>
)

export const SkeletonPlatformOverview = () => (
	<section className="relative py-24 overflow-hidden">
		<div className="absolute inset-0">
			<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
		</div>

		<div className="relative container mx-auto px-4">
			<div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto" />
			</div>

			<SkeletonGrid
				count={3}
				columns={3}
				gap={8}
				className="mb-16"
				renderItem={() => (
					<div className="space-y-4">
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-6 w-3/4 mx-auto" />
						<SkeletonText width={[100, 90, 80]} className="mx-auto" />
					</div>
				)}
			/>

			<div className="bg-gradient-to-r from-purple-50 to-purple-50 max-w-4xl mx-auto border-none shadow-sm p-8 text-center space-y-4">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto" />
			</div>

			<SkeletonGrid
				count={3}
				columns={3}
				gap={8}
				className="mt-16 max-w-3xl mx-auto"
				renderItem={() => (
					<div className="bg-white rounded-xl p-6 text-center shadow-sm space-y-4">
						<Skeleton className="h-8 w-1/2 mx-auto" />
						<SkeletonText width={[100, 90, 80]} className="mx-auto" />
					</div>
				)}
			/>
		</div>
	</section>
)

export const SkeletonCommunity = () => (
	<section className="py-20 relative overflow-hidden bg-blue-purple">
		<div className="relative container mx-auto px-4">
			<div className="text-center mb-20 max-w-3xl mx-auto space-y-4">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
				<div className="space-y-2">
					<SkeletonGrid
						count={3}
						columns={1}
						gap={3}
						renderItem={() => <Skeleton className="h-8 w-full" />}
					/>
				</div>

				<Skeleton className="h-40 w-full" />
			</div>

			<div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg max-w-3xl mx-auto overflow-hidden">
				<div className="relative space-y-4">
					<Skeleton className="h-8 w-1/2 mx-auto" />
					<SkeletonText width={[100, 90, 80]} className="mx-auto" />
					<div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
						<Skeleton className="h-12 w-48 mx-2" />
						<Skeleton className="h-12 w-48 mx-2" />
					</div>
				</div>
			</div>
		</div>
	</section>
)

export const SkeletonFinalCTA = () => (
	<section className="relative py-24 overflow-hidden">
		<div
			className="absolute inset-0 gradient-bg-blue-purple to-white"
			role="presentation"
			aria-hidden="true"
		>
			<div
				className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"
				role="presentation"
				aria-hidden="true"
			/>
		</div>

		<div className="relative container mx-auto px-4">
			<div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
				<Skeleton className="h-8 w-1/2 mx-auto" />
				<SkeletonText width={[100, 90, 80]} className="mx-auto" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
				<SkeletonGrid
					count={3}
					columns={1}
					gap={6}
					renderItem={() => (
						<div className="space-y-4">
							<Skeleton className="h-8 w-1/2 mx-auto" />
							<SkeletonText width={[100, 90, 80]} className="mx-auto" />
						</div>
					)}
				/>

				<div className="space-y-8">
					<div className="bg-white shadow-sm border-gray-100 p-8 space-y-4">
						<Skeleton className="h-8 w-1/2 mx-auto" />
						<SkeletonText width={[100, 90, 80]} className="mx-auto" />
					</div>

					<div className="bg-white border-gray-100 shadow-sm p-8 space-y-4">
						<Skeleton className="h-8 w-1/2 mx-auto" />
						<SkeletonText width={[100, 90, 80]} className="mx-auto" />
						<div className="space-y-3">
							<SkeletonGrid
								count={3}
								columns={1}
								gap={3}
								renderItem={() => <Skeleton className="h-12 w-full" />}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
)
