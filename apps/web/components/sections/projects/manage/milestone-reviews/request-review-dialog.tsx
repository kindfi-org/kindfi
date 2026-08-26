'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
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
import { useCreateMilestoneReviewRequest } from '~/hooks/milestone-reviews/use-milestone-review-requests'
import { useI18n } from '~/lib/i18n/context'

type RequestReviewDialogProps = {
	slug: string
	milestoneIndex: number
	milestoneTitle: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const RequestReviewDialog = ({
	slug,
	milestoneIndex,
	milestoneTitle,
	open,
	onOpenChange,
}: RequestReviewDialogProps) => {
	const { t } = useI18n()
	const [requestNotes, setRequestNotes] = useState('')
	const createRequest = useCreateMilestoneReviewRequest(slug)

	const handleSubmit = () => {
		createRequest.mutate(
			{
				milestoneIndex,
				milestoneTitle,
				requestNotes: requestNotes.trim() || undefined,
			},
			{
				onSuccess: () => {
					toast.success(t('profile.manageMilestones.requestSubmitted'))
					setRequestNotes('')
					onOpenChange(false)
				},
				onError: (error: Error) => {
					toast.error(error.message)
				},
			},
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t('profile.manageMilestones.requestDialogTitle')}</DialogTitle>
					<DialogDescription>
						{t('profile.manageMilestones.requestDialogDescription')
							.replace('{release}', String(milestoneIndex + 1))
							.replace('{title}', milestoneTitle)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2">
					<Label htmlFor="request-notes">{t('profile.manageMilestones.requestNotesLabel')}</Label>
					<Textarea
						id="request-notes"
						value={requestNotes}
						onChange={(event) => setRequestNotes(event.target.value)}
						placeholder={t('profile.manageMilestones.requestNotesPlaceholder')}
						rows={4}
						maxLength={2000}
					/>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						{t('profile.manageMilestones.cancel')}
					</Button>
					<Button type="button" onClick={handleSubmit} disabled={createRequest.isPending}>
						{createRequest.isPending
							? t('profile.manageMilestones.submitting')
							: t('profile.manageMilestones.submitRequest')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
