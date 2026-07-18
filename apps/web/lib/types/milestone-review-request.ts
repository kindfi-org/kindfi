export const MILESTONE_REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const

export type MilestoneReviewStatus = (typeof MILESTONE_REVIEW_STATUSES)[number]

export type MilestoneReviewRequest = {
	id: string
	projectId: string
	escrowContractId: string
	milestoneIndex: number
	milestoneTitle: string | null
	status: MilestoneReviewStatus
	requesterId: string
	reviewerId: string | null
	requestNotes: string | null
	reviewNotes: string | null
	createdAt: string
	reviewedAt: string | null
}

export type MilestoneReviewRequestWithRequester = MilestoneReviewRequest & {
	requesterDisplayName: string | null
}

export type AdminMilestoneReviewRequest = MilestoneReviewRequest & {
	projectTitle: string
	projectSlug: string
	requesterDisplayName: string | null
	reviewerDisplayName: string | null
}
