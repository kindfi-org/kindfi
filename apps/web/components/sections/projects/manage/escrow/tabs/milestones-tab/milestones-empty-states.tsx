'use client'

import { FileText, Loader2 } from 'lucide-react'
import { Card, CardContent } from '~/components/base/card'

export function MilestonesLoadingState() {
	return (
		<Card>
			<CardContent className="py-12">
				<div className="flex flex-col items-center justify-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-sm text-muted-foreground">Loading milestones...</p>
				</div>
			</CardContent>
		</Card>
	)
}

export function MilestonesEmptyState() {
	return (
		<Card>
			<CardContent className="py-12">
				<div className="flex flex-col items-center justify-center space-y-4">
					<FileText className="h-8 w-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						No milestones found. Milestones are defined when creating the
						escrow.
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
