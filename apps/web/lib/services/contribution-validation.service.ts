import { supabase } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import { getEscrowBalance } from '~/lib/services/escrow-balance.service'
import { resolveDisplayRaisedAmount } from '~/lib/utils/projects/project-funding'

export type ResolveProjectIdInput = {
	contractId?: string
	projectId?: string
}

export type ResolveProjectIdResult =
	| { success: true; projectId: string | null }
	| { success: false; error: string; status: 400 | 500 }

export type CheckDuplicateContributionResult =
	| { duplicate: true; contributionId: string }
	| { duplicate: false }

export type FundraisingGoalCheckResult = { allowed: true } | { allowed: false; error: string }

export async function checkFundraisingGoalNotReached(
	projectId: string,
	contractId?: string,
): Promise<FundraisingGoalCheckResult> {
	const { data: project, error: projectError } = await supabase
		.from('projects')
		.select('target_amount, current_amount')
		.eq('id', projectId)
		.single()

	if (projectError || !project) {
		logger.error('Failed to load project for fundraising goal check:', projectError)
		return {
			allowed: false,
			error: 'Failed to verify project fundraising status',
		}
	}

	const targetAmount = Number(project.target_amount ?? 0)
	if (targetAmount <= 0) {
		return { allowed: true }
	}

	let escrowContractAddress = contractId

	if (!escrowContractAddress) {
		const { data: escrowContract } = await supabase
			.from('escrow_contracts')
			.select('contract_id')
			.eq('project_id', projectId)
			.maybeSingle()

		escrowContractAddress = escrowContract?.contract_id ?? undefined
	}

	const dbRaised = Number(project.current_amount ?? 0)
	const onChainRaised = escrowContractAddress ? await getEscrowBalance(escrowContractAddress) : null
	const effectiveRaised =
		resolveDisplayRaisedAmount({
			dbRaised,
			escrowContractAddress,
			escrowBalance: onChainRaised,
			isLoadingEscrowBalance: false,
		}) ?? dbRaised

	if (effectiveRaised >= targetAmount) {
		return {
			allowed: false,
			error: 'This project has reached its fundraising goal and is no longer accepting donations.',
		}
	}

	return { allowed: true }
}

export async function resolveProjectId(
	input: ResolveProjectIdInput,
): Promise<ResolveProjectIdResult> {
	const { contractId, projectId } = input
	let finalProjectId: string | null = null

	if (contractId && typeof contractId === 'string') {
		const { data: escrowContract, error: escrowContractError } = await supabase
			.from('escrow_contracts')
			.select('project_id')
			.eq('contract_id', contractId)
			.maybeSingle()

		if (escrowContractError) {
			return {
				success: false,
				error: 'Failed to verify escrow contract',
				status: 500,
			}
		}
		if (escrowContract?.project_id) finalProjectId = escrowContract.project_id
	}

	if (projectId && typeof projectId === 'string') {
		if (finalProjectId && projectId !== finalProjectId) {
			return {
				success: false,
				error: 'Project does not match escrow contract. Use the contractId from the project page.',
				status: 400,
			}
		}
		if (!finalProjectId) finalProjectId = projectId
	}

	return { success: true, projectId: finalProjectId }
}

export async function checkDuplicateContribution(params: {
	transactionHash?: string
	projectId: string | null
	contributorId: string
}): Promise<CheckDuplicateContributionResult> {
	const { transactionHash, projectId, contributorId } = params

	if (!transactionHash) {
		return { duplicate: false }
	}

	const { data: existingTransaction } = await supabase
		.from('transactions')
		.select('id')
		.eq('transaction_hash', transactionHash)
		.single()

	if (!existingTransaction) {
		return { duplicate: false }
	}

	const { data: existingContribution } = await supabase
		.from('contributions')
		.select('id')
		.eq('project_id', projectId)
		.eq('contributor_id', contributorId)
		.single()

	if (existingContribution) {
		return { duplicate: true, contributionId: existingContribution.id }
	}

	return { duplicate: false }
}
