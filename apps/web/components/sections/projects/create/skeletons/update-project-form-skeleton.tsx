import { Skeleton } from '~/components/base/skeleton'

export function UpdateProjectFormSkeleton() {
	return (
		<div className="max-w-2xl mx-auto" aria-busy="true">
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
				{/* Title */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-10 w-full" />
				</div>

				{/* Description */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-32 w-full" />
				</div>

				{/* Target Amount and Minimum Investment */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				{/* Website */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-10 w-full" />
				</div>

				{/* Social Links */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-20" />
					<div className="space-y-3">
						<div className="flex gap-2">
							<Skeleton className="h-10 flex-1" />
							<Skeleton className="h-10 w-10" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-3/4" />
						</div>
					</div>
				</div>

				{/* Project Image */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-48 w-full rounded-lg" />
				</div>

				{/* Location */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-10 w-full" />
				</div>

				{/* Category */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-16" />
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{Array.from({ length: 12 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
							<Skeleton key={i} className="h-10 w-full rounded-full" />
						))}
					</div>
				</div>

				{/* Tags */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-12" />
					<div className="space-y-4">
						<div className="flex gap-2">
							<Skeleton className="h-10 flex-1" />
							<Skeleton className="h-10 w-10" />
						</div>
						<div className="flex flex-wrap gap-2">
							<Skeleton className="h-8 w-20 rounded-full" />
							<Skeleton className="h-8 w-16 rounded-full" />
							<Skeleton className="h-8 w-24 rounded-full" />
						</div>
					</div>
				</div>

				{/* Save Button Section */}
				<div className="pt-6 border-t border-gray-200">
					<div className="text-center space-y-4">
						<Skeleton className="h-4 w-32 mx-auto" />
						<Skeleton className="h-12 w-full" />
					</div>
				</div>
			</div>
		</div>
	)
}
