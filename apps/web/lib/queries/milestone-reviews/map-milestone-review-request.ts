import type {
	MilestoneReviewRequest,
	MilestoneReviewStatus,
} from '~/lib/types/milestone-review-request'

type MilestoneReviewRequestRow = {
	id: string
	project_id: string
	escrow_contract_id: string
	milestone_index: number
	milestone_title: string | null
	status: string
	requester_id: string
	reviewer_id: string | null
	request_notes: string | null
	review_notes: string | null
	created_at: string
	reviewed_at: string | null
}

export const mapMilestoneReviewRequestRow = (
	row: MilestoneReviewRequestRow,
): MilestoneReviewRequest => ({
	id: row.id,
	projectId: row.project_id,
	escrowContractId: row.escrow_contract_id,
	milestoneIndex: row.milestone_index,
	milestoneTitle: row.milestone_title,
	status: row.status as MilestoneReviewStatus,
	requesterId: row.requester_id,
	reviewerId: row.reviewer_id,
	requestNotes: row.request_notes,
	reviewNotes: row.review_notes,
	createdAt: row.created_at,
	reviewedAt: row.reviewed_at,
})
