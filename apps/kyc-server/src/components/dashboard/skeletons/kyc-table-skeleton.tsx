import { Skeleton } from '~/components/base/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/base/table'

export function KycTableSkeleton() {
	return (
		<div className="flex w-full flex-col justify-start gap-6">
			{/* Filters Skeleton */}
			<div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center lg:px-6">
				<div className="flex items-center gap-2">
					<Skeleton className="size-4" />
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-9 w-32" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-10" />
					<Skeleton className="h-9 w-32" />
				</div>
				<div className="sm:ml-auto">
					<Skeleton className="h-9 w-36" />
				</div>
			</div>

			<div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
				<div className="overflow-hidden rounded-lg border">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-muted">
							<TableRow>
								<TableHead className="w-8">
									<Skeleton className="size-4" />
								</TableHead>
								<TableHead className="w-8">
									<Skeleton className="size-4" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-16" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-12" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-24" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-16" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-16" />
								</TableHead>
								<TableHead className="w-8">
									<Skeleton className="size-4" />
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 10 }).map((_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: safe to use index for static skeletons
								<TableRow key={index}>
									<TableCell>
										<Skeleton className="size-4" />
									</TableCell>
									<TableCell>
										<Skeleton className="size-4" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20 rounded-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-16 rounded-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="size-8" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Pagination Skeleton */}
				<div className="flex items-center justify-between px-4">
					<div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
						<Skeleton className="h-4 w-32" />
					</div>
					<div className="flex w-full items-center gap-8 lg:w-fit">
						<div className="hidden items-center gap-2 lg:flex">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-9 w-20" />
						</div>
						<div className="flex w-fit items-center justify-center text-sm font-medium">
							<Skeleton className="h-4 w-24" />
						</div>
						<div className="ml-auto flex items-center gap-2 lg:ml-0">
							<Skeleton className="size-8" />
							<Skeleton className="size-8" />
							<Skeleton className="size-8" />
							<Skeleton className="size-8" />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
