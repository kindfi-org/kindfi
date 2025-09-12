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

export function PendingInvitationsSkeleton() {
	return (
		<div>
			{/* Desktop Skeleton */}
			<Card className="hidden md:block">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-6 w-48" />
					</div>
					<Skeleton className="h-4 w-80" />
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Invited</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-[50px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 2 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
								<TableRow key={i}>
									<TableCell>
										<div className="flex items-center gap-2">
											<Skeleton className="h-4 w-4" />
											<Skeleton className="h-4 w-48" />
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
										<Skeleton className="h-6 w-16" />
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
					<Skeleton className="h-6 w-48" />
				</div>
				{Array.from({ length: 2 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
					<Card key={i}>
						<CardContent className="p-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<Skeleton className="h-4 w-4" />
										<Skeleton className="h-4 w-48" />
									</div>
									<div className="flex gap-2 mb-2">
										<Skeleton className="h-5 w-16" />
										<Skeleton className="h-5 w-20" />
										<Skeleton className="h-5 w-16" />
									</div>
									<Skeleton className="h-3 w-32" />
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
