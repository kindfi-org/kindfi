'use client'

import type { MultiReleaseMilestone, SingleReleaseMilestone } from '@trustless-work/escrow'
import { useMemo, useState } from 'react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import { useMilestoneReviewRequests } from '~/hooks/milestone-reviews/use-milestone-review-requests'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useI18n } from '~/lib/i18n/context'
import type { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import type { MilestoneReviewRequestWithRequester } from '~/lib/types/milestone-review-request'
import { cn } from '~/lib/utils'
import {
	formatMilestoneReleasePhase,
	getMilestoneReleasePhase,
	getMilestoneReleasePhaseBadgeVariant,
} from '~/lib/utils/escrow/milestone-utils'
import { ManageSectionHeader } from '../manage-section-header'
import { RequestReviewDialog } from './request-review-dialog'

type MilestoneReviewsPanelProps = {
	slug: string
}

type ReviewCtaState =
	| 'hidden'
	| 'request'
	| 'pending'
	| 'approved'
	| 'rejected'
	| 'on_chain_complete'

const getLatestRequestForMilestone = (
	requests: MilestoneReviewRequestWithRequester[],
	milestoneIndex: number,
): MilestoneReviewRequestWithRequester | undefined => {
	return requests.find((request) => request.milestoneIndex === milestoneIndex)
}

const getReviewCtaState = ({
	phase,
	latestRequest,
}: {
	phase: ReturnType<typeof getMilestoneReleasePhase>
	latestRequest?: MilestoneReviewRequestWithRequester
}): ReviewCtaState => {
	if (phase === 'released' || phase === 'approved') {
		return 'on_chain_complete'
	}

	if (latestRequest?.status === 'pending') {
		return 'pending'
	}

	if (latestRequest?.status === 'approved') {
		return 'approved'
	}

	if (latestRequest?.status === 'rejected') {
		return 'request'
	}

	return 'request'
}

export const MilestoneReviewsPanel = ({ slug }: MilestoneReviewsPanelProps) => {
	const { t } = useI18n()
	const { data: project, isLoading: isProjectLoading } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getBasicProjectInfoBySlug>>
	>('basic-project-info', slug, 'basic-info', { additionalKeyValues: [slug] })

	const escrowContractAddress = project?.escrowContractAddress ?? ''
	const { escrowData, isLoading: isEscrowLoading } = useEscrowData({
		escrowContractAddress,
		escrowType: project?.escrowType,
	})

	const { data: reviewRequests = [], isLoading: isRequestsLoading } =
		useMilestoneReviewRequests(slug)

	const [dialogState, setDialogState] = useState<{
		open: boolean
		milestoneIndex: number
		milestoneTitle: string
	}>({ open: false, milestoneIndex: 0, milestoneTitle: '' })

	const milestones = useMemo(
		() => (escrowData?.milestones ?? []) as (SingleReleaseMilestone | MultiReleaseMilestone)[],
		[escrowData?.milestones],
	)

	const isLoading = isProjectLoading || isEscrowLoading || isRequestsLoading

	if (isLoading) {
		return (
			<div className="space-y-4" aria-live="polite">
				<div className="h-24 animate-pulse rounded-xl bg-muted" />
				<div className="h-40 animate-pulse rounded-xl bg-muted" />
			</div>
		)
	}

	if (!escrowContractAddress) {
		return (
			<div className="space-y-6">
				<ManageSectionHeader
					title={t('profile.manageMilestones.title')}
					description={t('profile.manageMilestones.noEscrowDescription')}
				/>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<ManageSectionHeader
				title={t('profile.manageMilestones.title')}
				description={t('profile.manageMilestones.description')}
			/>

			{milestones.length === 0 ? (
				<Card className="border-border">
					<CardContent className="py-8 text-center text-muted-foreground">
						{t('profile.manageMilestones.noMilestones')}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{milestones.map((milestone, index) => {
						const phase = getMilestoneReleasePhase(milestone)
						const latestRequest = getLatestRequestForMilestone(reviewRequests, index)
						const ctaState = getReviewCtaState({ phase, latestRequest })
						const milestoneTitle =
							milestone.description?.trim() ||
							t('profile.manageMilestones.releaseLabel').replace('{n}', String(index + 1))

						return (
							<Card
								key={`${escrowContractAddress}-release-${milestone.description}-${milestone.amount ?? ''}-${milestone.receiver ?? ''}`}
								className="border-border"
							>
								<CardHeader className="pb-3">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div className="space-y-1">
											<CardTitle className="text-lg">
												{t('profile.manageMilestones.releaseLabel').replace(
													'{n}',
													String(index + 1),
												)}
											</CardTitle>
											<CardDescription>{milestoneTitle}</CardDescription>
										</div>
										<div className="flex flex-wrap gap-2">
											<Badge variant={getMilestoneReleasePhaseBadgeVariant(phase)}>
												{formatMilestoneReleasePhase(phase)}
											</Badge>
											{latestRequest ? (
												<Badge
													variant={
														latestRequest.status === 'pending'
															? 'secondary'
															: latestRequest.status === 'approved'
																? 'default'
																: 'destructive'
													}
													className="capitalize"
												>
													{t(`profile.manageMilestones.requestStatus.${latestRequest.status}`)}
												</Badge>
											) : null}
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									{latestRequest?.requestNotes ? (
										<p className="text-sm text-muted-foreground">
											<span className="font-medium text-foreground">
												{t('profile.manageMilestones.yourNotes')}:
											</span>{' '}
											{latestRequest.requestNotes}
										</p>
									) : null}

									{latestRequest?.status === 'rejected' && latestRequest.reviewNotes ? (
										<p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
											<span className="font-medium text-foreground">
												{t('profile.manageMilestones.adminNotes')}:
											</span>{' '}
											{latestRequest.reviewNotes}
										</p>
									) : null}

									{ctaState === 'request' ? (
										<Button
											type="button"
											onClick={() =>
												setDialogState({
													open: true,
													milestoneIndex: index,
													milestoneTitle,
												})
											}
										>
											{t('profile.manageMilestones.requestReview')}
										</Button>
									) : null}

									{ctaState === 'pending' ? (
										<p className="text-sm text-muted-foreground">
											{t('profile.manageMilestones.pendingMessage')}
										</p>
									) : null}

									{ctaState === 'approved' ? (
										<p className="text-sm text-muted-foreground">
											{t('profile.manageMilestones.approvedMessage')}
										</p>
									) : null}

									{ctaState === 'on_chain_complete' ? (
										<p className={cn('text-sm text-muted-foreground')}>
											{t('profile.manageMilestones.onChainCompleteMessage')}
										</p>
									) : null}
								</CardContent>
							</Card>
						)
					})}
				</div>
			)}

			<RequestReviewDialog
				slug={slug}
				milestoneIndex={dialogState.milestoneIndex}
				milestoneTitle={dialogState.milestoneTitle}
				open={dialogState.open}
				onOpenChange={(open) => setDialogState((current) => ({ ...current, open }))}
			/>
		</div>
	)
}
