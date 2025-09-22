import { Card, CardContent, CardHeader } from '~/components/base/card'
import { Skeleton } from '~/components/base/skeleton'

export function InviteMemberFormSkeleton() {
	return (
		<Card aria-busy="true" aria-live="polite" className="bg-white">
			<span className="sr-only">Loading invite member form…</span>

			<CardHeader>
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-5" />
					<Skeleton className="h-6 w-40" />
				</div>
				<Skeleton className="mt-2 h-4 w-80" />
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-9 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-9 w-full" />
					</div>
				</div>

				<div className="space-y-2">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-9 w-full" />
				</div>

				<div className="flex justify-end">
					<Skeleton className="h-9 w-28" />
				</div>
			</CardContent>
		</Card>
	)
}
