import { Card, CardContent } from '~/components/base/card'
import { Skeleton } from '~/components/base/skeleton'

export function ProjectPitchFormSkeleton() {
	return (
		<div className="max-w-5xl w-full">
			<Card className="bg-white">
				<CardContent>
					<div className="w-full space-y-6">
						{/* Title */}
						<div className="space-y-2 mt-4">
							<Skeleton className="h-4 w-16" />
							<div className="relative">
								<Skeleton className="h-10 w-full" />
								<div className="absolute right-3 top-1/2 -translate-y-1/2">
									<Skeleton className="h-3 w-10" />
								</div>
							</div>
							<Skeleton className="h-3 w-64" />
						</div>

						{/* Story (RichTextEditor) */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-16" />
							<div className="border rounded-lg overflow-hidden">
								{/* Toolbar */}
								<div className="flex items-center gap-1 p-2 bg-gray-50 border-b">
									{Array.from({ length: 8 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
										<Skeleton key={i} className="h-8 w-8" />
									))}
								</div>
								{/* Editor area */}
								<Skeleton className="h-48 w-full rounded-none" />
								{/* Footer chars */}
								<div className="px-4 py-2 bg-gray-50 border-t text-end">
									<Skeleton className="h-3 w-24 ml-auto" />
								</div>
							</div>
							<Skeleton className="h-3 w-80" />
						</div>

						{/* Pitch Deck (FileUpload) */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-40" />
							<div className="border-2 border-dashed rounded-lg p-6">
								<div className="flex flex-col items-center gap-2">
									<Skeleton className="h-12 w-12 rounded-md" />
									<Skeleton className="h-4 w-56" />
									<Skeleton className="h-3 w-40" />
									<Skeleton className="h-3 w-48" />
								</div>
							</div>
							<Skeleton className="h-3 w-72" />
						</div>

						{/* Video URL */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-40" />
							<div className="relative">
								<Skeleton className="h-10 w-full" />
								<div className="absolute left-3 top-1/2 -translate-y-1/2">
									<Skeleton className="h-4 w-4 rounded" />
								</div>
							</div>
							<Skeleton className="h-3 w-80" />
						</div>

						{/* Footer / Submit */}
						<div className="pt-6 border-t border-gray-200">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-10 w-40" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
