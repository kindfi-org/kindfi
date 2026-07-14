'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import {
	canManagerSubmitForReview,
	getAdminStatusActions,
	PROJECT_STATUS_COLORS,
	PROJECT_STATUS_LABELS,
	type ProjectStatus,
} from '~/lib/projects/project-status'
import { cn } from '~/lib/utils'

type ProjectStatusPanelProps = {
	slug: string
	status: ProjectStatus
	isPlatformAdmin: boolean
}

export function ProjectStatusPanel({ slug, status, isPlatformAdmin }: ProjectStatusPanelProps) {
	const queryClient = useQueryClient()
	const router = useRouter()

	const updateStatus = useMutation({
		mutationFn: async (nextStatus: ProjectStatus) => {
			const response = await fetch(`/api/projects/${slug}/manage/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: nextStatus }),
			})

			const payload = (await response.json().catch(() => ({}))) as {
				error?: string
				status?: ProjectStatus
				label?: string
			}

			if (!response.ok) {
				throw new Error(payload.error || 'Failed to update project status')
			}

			return payload
		},
		onSuccess: (payload) => {
			toast.success(
				payload.label
					? `Project marked as ${payload.label.toLowerCase()}`
					: 'Project status updated',
			)
			void queryClient.invalidateQueries({ queryKey: ['supabase', 'basic-project-info', slug] })
			router.refresh()
		},
		onError: (error: Error) => {
			toast.error(error.message)
		},
	})

	const showManagerSubmit = !isPlatformAdmin && canManagerSubmitForReview(status)
	const awaitingReview = !isPlatformAdmin && status === 'review'
	const adminActions = getAdminStatusActions(status)

	return (
		<Card className="border-border/80 bg-card/80">
			<CardHeader className="pb-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="space-y-1">
						<CardTitle className="text-lg">Campaign status</CardTitle>
						<CardDescription>
							{isPlatformAdmin
								? 'Update the project lifecycle for creators and the public campaign page.'
								: 'Tell the KindFi team when your project is ready for campaign review.'}
						</CardDescription>
					</div>
					<Badge
						variant="outline"
						className={cn('text-xs font-medium capitalize', PROJECT_STATUS_COLORS[status])}
					>
						{PROJECT_STATUS_LABELS[status]}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{showManagerSubmit ? (
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm text-muted-foreground">
							Finish your content, then mark the project ready so an admin can review and launch the
							campaign.
						</p>
						<Button
							onClick={() => updateStatus.mutate('review')}
							disabled={updateStatus.isPending}
							className="shrink-0"
						>
							{updateStatus.isPending ? 'Submitting…' : 'Mark as ready to begin campaign'}
						</Button>
					</div>
				) : null}

				{awaitingReview ? (
					<p className="text-sm text-muted-foreground">
						Your project is in review. An admin will activate the campaign when it is approved.
					</p>
				) : null}

				{!isPlatformAdmin && status === 'active' ? (
					<p className="text-sm text-muted-foreground">
						Your campaign is live. Keep content and updates fresh for supporters.
					</p>
				) : null}

				{!isPlatformAdmin && status === 'funded' ? (
					<p className="text-sm text-muted-foreground">
						This campaign is marked complete. You can still post updates for supporters.
					</p>
				) : null}

				{!isPlatformAdmin && status === 'paused' ? (
					<p className="text-sm text-muted-foreground">
						This campaign is paused. Contact support if you need it reactivated.
					</p>
				) : null}

				{isPlatformAdmin ? (
					<div className="flex flex-wrap gap-2">
						{adminActions.map((action) => (
							<Button
								key={action.status}
								variant={action.variant ?? 'outline'}
								size="sm"
								disabled={updateStatus.isPending}
								onClick={() => updateStatus.mutate(action.status)}
							>
								{action.label}
							</Button>
						))}
					</div>
				) : null}
			</CardContent>
		</Card>
	)
}
