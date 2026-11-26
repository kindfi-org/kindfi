import { supabase } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import {
	CAMPAIGN_COMPLETE_DONATION_MESSAGE,
	isProjectAcceptingDonations,
	isProjectCampaignComplete,
	PROJECT_NOT_ACCEPTING_DONATIONS_MESSAGE,
	type ProjectStatus,
} from '~/lib/projects/project-status'
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

export type ContributionAllowedResult = { allowed: true } | { allowed: false; error: string }

export type FundraisingGoalCheckResult = ContributionAllowedResult

export type FundEscrowProxyValidationResult =
	| { ok: true }
	| { ok: false; error: string; status: 400 | 403 | 500 }

const GOAL_REACHED_ERROR =
	'This project has reached its fundraising goal and is no longer accepting donations.'

const getStatusRejectionMessage = (status: ProjectStatus): string => {
	if (isProjectCampaignComplete(status)) {
		return CAMPAIGN_COMPLETE_DONATION_MESSAGE
	}

	return PROJECT_NOT_ACCEPTING_DONATIONS_MESSAGE
}

export async function validateContributionAllowed(
	projectId: string,
	contractId?: string,
): Promise<ContributionAllowedResult> {
	const { data: project, error: projectError } = await supabase
		.from('projects')
		.select('status, target_amount, current_amount')
		.eq('id', projectId)
		.single()

	if (projectError || !project) {
		logger.error('Failed to load project for contribution validation:', projectError)
		return {
			allowed: false,
			error: 'Failed to verify project fundraising status',
		}
	}

	const status = (project.status ?? 'draft') as ProjectStatus
	if (!isProjectAcceptingDonations(status)) {
		return {
			allowed: false,
			error: getStatusRejectionMessage(status),
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
			error: GOAL_REACHED_ERROR,
		}
	}

	return { allowed: true }
}

export function isFundEscrowProxyPath(path: string, method: string): boolean {
	return method === 'POST' && path.startsWith('escrow/') && path.endsWith('/fund-escrow')
}

export function readContractIdFromFundEscrowBody(body: string | undefined): string | null {
	if (!body) return null

	try {
		const parsed = JSON.parse(body) as { contractId?: unknown }
		return typeof parsed.contractId === 'string' && parsed.contractId.trim().length > 0
			? parsed.contractId.trim()
			: null
	} catch {
		return null
	}
}

export async function validateFundEscrowProxyRequest(
	body: string | undefined,
): Promise<FundEscrowProxyValidationResult> {
	const contractId = readContractIdFromFundEscrowBody(body)
	if (!contractId) {
		return { ok: false, error: 'contractId is required', status: 400 }
	}

	const projectResolution = await resolveProjectId({ contractId })
	if (!projectResolution.success) {
		return { ok: false, error: projectResolution.error, status: projectResolution.status }
	}

	if (!projectResolution.projectId) {
		return { ok: false, error: 'Project not found for escrow contract', status: 400 }
	}

	const validation = await validateContributionAllowed(projectResolution.projectId, contractId)
	if (!validation.allowed) {
		return { ok: false, error: validation.error, status: 403 }
	}

	return { ok: true }
}

export async function checkFundraisingGoalNotReached(
	projectId: string,
	contractId?: string,
): Promise<FundraisingGoalCheckResult> {
	return validateContributionAllowed(projectId, contractId)
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
