import { Card, CardContent, CardHeader } from '~/components/base/card'
import { Skeleton } from '~/components/base/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/base/table'

export function MemberListSkeleton() {
	return (
		<div aria-busy="true">
			<span className="sr-only">Loading members…</span>
			{/* Desktop Skeleton */}
			<Card className="hidden md:block bg-white">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-6 w-40" />
					</div>
					<Skeleton className="h-4 w-80" />
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Member</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead className="w-[50px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 3 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
								<TableRow key={i}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Skeleton className="h-8 w-8 rounded-full" />
											<div>
												<Skeleton className="h-4 w-32 mb-1" />
												<Skeleton className="h-3 w-48" />
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-8" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Mobile Skeleton */}
			<div className="md:hidden space-y-4">
				<div className="flex items-center gap-2 mb-4">
					<Skeleton className="h-5 w-5" />
					<Skeleton className="h-6 w-40" />
				</div>
				<Skeleton className="h-4 w-full sm:w-80" />
				{Array.from({ length: 3 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
					<Card key={i} className="bg-white">
						<CardContent className="p-4">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3 flex-1">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1">
										<Skeleton className="h-4 w-32 mb-2" />
										<Skeleton className="h-3 w-48 mb-2" />
										<div className="flex gap-2">
											<Skeleton className="h-5 w-16" />
											<Skeleton className="h-5 w-20" />
										</div>
										<Skeleton className="h-3 w-24 mt-2" />
									</div>
								</div>
								<Skeleton className="h-8 w-8" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
