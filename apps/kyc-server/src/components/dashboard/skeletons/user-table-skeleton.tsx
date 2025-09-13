export function UserTableSkeleton() {
	return (
		<div
			className="flex w-full flex-col justify-start gap-6"
			aria-label="Loading users table"
		>
			{/* Filters skeleton */}
			<div className="flex flex-col gap-4 px-4 lg:px-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="space-y-2">
						<div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						<div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
					</div>
					<div className="flex gap-2">
						<div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						<div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>
				</div>

				{/* Search bar skeleton */}
				<div className="flex gap-2">
					<div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					<div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
				</div>
			</div>

			{/* Table skeleton */}
			<div className="px-4 lg:px-6">
				<div className="overflow-hidden rounded-lg border">
					<div className="divide-y divide-border">
						{/* Header skeleton */}
						<div className="bg-muted/50">
							<div className="flex items-center h-12 px-4">
								{Array.from({ length: 8 }).map((_, i) => (
									<div
										key={i}
										className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-4"
										style={{ width: `${Math.random() * 40 + 60}px` }}
									></div>
								))}
							</div>
						</div>

						{/* Rows skeleton */}
						{Array.from({ length: 8 }).map((_, rowIndex) => (
							<div key={rowIndex} className="flex items-center h-16 px-4">
								{Array.from({ length: 8 }).map((_, colIndex) => (
									<div key={colIndex} className="mr-4">
										{colIndex === 0 ? (
											<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
										) : colIndex === 1 ? (
											<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
										) : colIndex === 2 ? (
											<div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
										) : colIndex === 4 ? (
											<div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
										) : colIndex === 5 ? (
											<div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
										) : (
											<div
												className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
												style={{ width: `${Math.random() * 60 + 40}px` }}
											></div>
										)}
									</div>
								))}
							</div>
						))}
					</div>
				</div>

				{/* Pagination skeleton */}
				<div className="flex items-center justify-between py-4">
					<div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					<div className="flex gap-2">
						<div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						<div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						<div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						<div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					</div>
				</div>
			</div>
		</div>
	)
}
