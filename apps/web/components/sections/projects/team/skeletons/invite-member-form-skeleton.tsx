import { Card, CardContent, CardHeader } from '~/components/base/card'

export function InviteMemberFormSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<div className="h-5 w-5 bg-muted rounded animate-pulse" />
					<div className="h-6 w-40 bg-muted rounded animate-pulse" />
				</div>
				<div className="h-4 w-80 bg-muted rounded animate-pulse" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="h-4 w-24 bg-muted rounded animate-pulse" />
							<div className="h-10 w-full bg-muted rounded animate-pulse" />
						</div>
						<div className="space-y-2">
							<div className="h-4 w-16 bg-muted rounded animate-pulse" />
							<div className="h-10 w-full bg-muted rounded animate-pulse" />
						</div>
					</div>
					<div className="space-y-2">
						<div className="h-4 w-32 bg-muted rounded animate-pulse" />
						<div className="h-10 w-full bg-muted rounded animate-pulse" />
					</div>
					<div className="flex justify-end">
						<div className="h-10 w-32 bg-muted rounded animate-pulse" />
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
