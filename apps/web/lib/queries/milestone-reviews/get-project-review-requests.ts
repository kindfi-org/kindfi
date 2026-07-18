import type { TypedSupabaseClient } from '@packages/lib/types'
import type { MilestoneReviewRequestWithRequester } from '~/lib/types/milestone-review-request'
import { mapMilestoneReviewRequestRow } from './map-milestone-review-request'

export async function getProjectReviewRequests(
	client: TypedSupabaseClient,
	projectId: string,
): Promise<MilestoneReviewRequestWithRequester[]> {
	const { data, error } = await client
		.from('milestone_review_requests')
		.select(
			`
			id,
			project_id,
			escrow_contract_id,
			milestone_index,
			milestone_title,
			status,
			requester_id,
			reviewer_id,
			request_notes,
			review_notes,
			created_at,
			reviewed_at,
			requester:requester_id ( display_name )
		`,
		)
		.eq('project_id', projectId)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (data ?? []).map((row) => {
		const requester = row.requester as { display_name: string | null } | null
		return {
			...mapMilestoneReviewRequestRow(row),
			requesterDisplayName: requester?.display_name ?? null,
		}
	})
}
