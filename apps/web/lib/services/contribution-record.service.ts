import { supabase } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'

export type CreateContributionRecordResult =
	| { success: true; contributionId: string }
	| { success: false; error: string; details?: string }

export type CreateContributionWithProjectUpdateResult = CreateContributionRecordResult

export async function createContributionWithProjectUpdate(params: {
	projectId: string
	contributorId: string
	amount: number
}): Promise<CreateContributionWithProjectUpdateResult> {
	const { data: contributionId, error } = await supabase.rpc(
		'create_contribution_and_update_project',
		{
			p_project_id: params.projectId,
			p_contributor_id: params.contributorId,
			p_amount: params.amount,
		},
	)

	if (error || !contributionId) {
		logger.error('Error creating contribution with project update:', error)
		return {
			success: false,
			error: 'Failed to create contribution',
			details: error?.message ?? 'No contribution id returned',
		}
	}

	return { success: true, contributionId }
}

/** @deprecated Use createContributionWithProjectUpdate for atomic insert + project totals update. */
export async function createContributionRecord(params: {
	projectId: string | null
	contributorId: string
	amount: number
}): Promise<CreateContributionRecordResult> {
	if (!params.projectId) {
		return {
			success: false,
			error: 'Failed to create contribution',
			details: 'project_id is required',
		}
	}

	return createContributionWithProjectUpdate({
		projectId: params.projectId,
		contributorId: params.contributorId,
		amount: params.amount,
	})
}
