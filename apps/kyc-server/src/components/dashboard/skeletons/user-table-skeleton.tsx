const HEADER_WIDTHS = [72, 88, 120, 64, 96, 112, 80, 48] as const
const CELL_WIDTHS = [16, 16, 96, 96, 64, 80, 100, 32] as const

export function UserTableSkeleton() {
	return (
		<div
			className="flex w-full flex-col justify-start gap-6"
			role="status"
			aria-busy="true"
			aria-live="polite"
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
										// biome-ignore lint/suspicious/noArrayIndexKey: intentional use of index for stable skeleton rendering
										key={i}
										className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-4"
										style={{ width: `${HEADER_WIDTHS[i % HEADER_WIDTHS.length]}px` }}
									></div>
								))}
							</div>
						</div>

						{/* Rows skeleton */}
						{Array.from({ length: 8 }).map((_, rowIndex) => (
							<div 
								// biome-ignore lint/suspicious/noArrayIndexKey: intentional use of index for stable skeleton rendering
								key={rowIndex} 
								className="flex items-center h-16 px-4"
							>
								{Array.from({ length: 8 }).map((_, colIndex) => (
									<div 
										// biome-ignore lint/suspicious/noArrayIndexKey: intentional use of index for stable skeleton rendering
										key={colIndex} 
										className="mr-4"
									>
										{colIndex === 0 ? (
											<div 
												className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
												style={{ width: `${CELL_WIDTHS[0]}px` }}
											></div>
										) : colIndex === 1 ? (
											<div 
												className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
												style={{ width: `${CELL_WIDTHS[1]}px` }}
											></div>
										) : colIndex === 2 ? (
											<div 
												className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
												style={{ width: `${CELL_WIDTHS[2]}px` }}
											></div>
										) : colIndex === 4 ? (
											<div 
												className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
												style={{ width: `${CELL_WIDTHS[4]}px` }}
											></div>
										) : colIndex === 5 ? (
											<div 
												className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
												style={{ width: `${CELL_WIDTHS[5]}px` }}
											></div>
										) : (
											<div
												className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
												style={{ width: `${CELL_WIDTHS[colIndex % CELL_WIDTHS.length]}px` }}
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
