'use client'

import Link from 'next/link'
import { useState } from 'react'
import { IoOpenOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
import { Label } from '~/components/base/label'
import { Textarea } from '~/components/base/textarea'
import {
	type AdminReviewFilter,
	useAdminMilestoneReviews,
	useUpdateMilestoneReviewRequest,
} from '~/hooks/milestone-reviews/use-admin-milestone-reviews'
import type { AdminMilestoneReviewRequest } from '~/lib/types/milestone-review-request'
import { cn } from '~/lib/utils'
import { AdminSectionHeader } from '../admin-section-header'

const FILTER_TABS: { value: AdminReviewFilter; label: string }[] = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'all', label: 'All' },
]

const formatDate = (value: string): string => {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value))
}

const ReviewQueueItem = ({
	request,
	onApprove,
	onReject,
	isUpdating,
}: {
	request: AdminMilestoneReviewRequest
	onApprove: (request: AdminMilestoneReviewRequest) => void
	onReject: (request: AdminMilestoneReviewRequest) => void
	isUpdating: boolean
}) => {
	const releaseLabel = request.milestoneTitle
		? `Release ${request.milestoneIndex + 1}: ${request.milestoneTitle}`
		: `Release ${request.milestoneIndex + 1}`

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-1">
						<CardTitle className="text-lg">
							<Link
								href={`/projects/${request.projectSlug}`}
								className="hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								{request.projectTitle}
							</Link>
						</CardTitle>
						<CardDescription>{releaseLabel}</CardDescription>
					</div>
					<Badge
						variant={
							request.status === 'pending'
								? 'secondary'
								: request.status === 'approved'
									? 'default'
									: 'destructive'
						}
						className="capitalize"
					>
						{request.status}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
					<p>
						<span className="font-medium text-foreground">Requested by:</span>{' '}
						{request.requesterDisplayName ?? 'Unknown'}
					</p>
					<p>
						<span className="font-medium text-foreground">Submitted:</span>{' '}
						{formatDate(request.createdAt)}
					</p>
					{request.reviewedAt ? (
						<p>
							<span className="font-medium text-foreground">Reviewed:</span>{' '}
							{formatDate(request.reviewedAt)}
							{request.reviewerDisplayName ? ` by ${request.reviewerDisplayName}` : ''}
						</p>
					) : null}
				</div>

				{request.requestNotes ? (
					<p className="rounded-lg bg-muted/50 p-3 text-sm">
						<span className="font-medium">Owner notes:</span> {request.requestNotes}
					</p>
				) : null}

				{request.reviewNotes ? (
					<p className="rounded-lg border border-border p-3 text-sm">
						<span className="font-medium">Admin notes:</span> {request.reviewNotes}
					</p>
				) : null}

				<div className="flex flex-wrap gap-2">
					{request.status === 'pending' ? (
						<>
							<Button type="button" onClick={() => onApprove(request)} disabled={isUpdating}>
								Approve
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => onReject(request)}
								disabled={isUpdating}
							>
								Reject
							</Button>
						</>
					) : null}
					<Button type="button" variant="outline" size="sm" asChild>
						<Link href={`/projects/${request.projectSlug}/manage/settings/manage`}>
							Open Escrow ops
							<IoOpenOutline className="ml-1.5 h-4 w-4" aria-hidden="true" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}

export const MilestoneReviewsQueue = () => {
	const [filter, setFilter] = useState<AdminReviewFilter>('pending')
	const { data: requests = [], isLoading, error } = useAdminMilestoneReviews(filter)
	const updateRequest = useUpdateMilestoneReviewRequest()

	const [rejectDialog, setRejectDialog] = useState<{
		open: boolean
		request: AdminMilestoneReviewRequest | null
		notes: string
	}>({ open: false, request: null, notes: '' })

	const handleApprove = (request: AdminMilestoneReviewRequest) => {
		updateRequest.mutate(
			{ id: request.id, status: 'approved' },
			{
				onSuccess: () => toast.success('Milestone review approved'),
				onError: (err: Error) => toast.error(err.message),
			},
		)
	}

	const handleRejectSubmit = () => {
		if (!rejectDialog.request) return

		updateRequest.mutate(
			{
				id: rejectDialog.request.id,
				status: 'rejected',
				reviewNotes: rejectDialog.notes.trim() || undefined,
			},
			{
				onSuccess: () => {
					toast.success('Milestone review rejected')
					setRejectDialog({ open: false, request: null, notes: '' })
				},
				onError: (err: Error) => toast.error(err.message),
			},
		)
	}

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Milestone reviews"
				description="Review milestone requests submitted by project owners. Approve or reject off-chain, then complete on-chain escrow steps in Escrow ops."
			/>

			<div className="flex flex-wrap gap-2">
				{FILTER_TABS.map((tab) => (
					<Button
						key={tab.value}
						type="button"
						variant={filter === tab.value ? 'default' : 'outline'}
						size="sm"
						onClick={() => setFilter(tab.value)}
						className={cn(filter === tab.value && 'pointer-events-none')}
					>
						{tab.label}
					</Button>
				))}
			</div>

			{isLoading ? (
				<div className="space-y-4" aria-live="polite">
					<div className="h-32 animate-pulse rounded-xl bg-muted" />
					<div className="h-32 animate-pulse rounded-xl bg-muted" />
				</div>
			) : null}

			{error ? (
				<Card>
					<CardContent className="py-8 text-center text-destructive">
						{error instanceof Error ? error.message : 'Failed to load queue'}
					</CardContent>
				</Card>
			) : null}

			{!isLoading && !error && requests.length === 0 ? (
				<Card>
					<CardContent className="py-10 text-center text-muted-foreground">
						No {filter === 'all' ? '' : filter} milestone review requests.
					</CardContent>
				</Card>
			) : null}

			<div className="space-y-4">
				{requests.map((request) => (
					<ReviewQueueItem
						key={request.id}
						request={request}
						onApprove={handleApprove}
						onReject={(item) => setRejectDialog({ open: true, request: item, notes: '' })}
						isUpdating={updateRequest.isPending}
					/>
				))}
			</div>

			<Dialog
				open={rejectDialog.open}
				onOpenChange={(open) =>
					setRejectDialog((current) => ({
						...current,
						open,
						request: open ? current.request : null,
					}))
				}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Reject milestone review</DialogTitle>
						<DialogDescription>
							Optionally share feedback with the project owner about why this request was rejected.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Label htmlFor="reject-notes">Admin notes (optional)</Label>
						<Textarea
							id="reject-notes"
							value={rejectDialog.notes}
							onChange={(event) =>
								setRejectDialog((current) => ({ ...current, notes: event.target.value }))
							}
							rows={4}
							maxLength={2000}
						/>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setRejectDialog({ open: false, request: null, notes: '' })}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleRejectSubmit}
							disabled={updateRequest.isPending}
						>
							{updateRequest.isPending ? 'Rejecting…' : 'Reject request'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
