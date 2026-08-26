import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { EscrowType } from '@trustless-work/escrow'
import { revalidatePath } from 'next/cache'
import { Logger } from '~/lib/logger'
import { inferEscrowTypeFromSaveData } from '~/lib/utils/escrow/resolve-escrow-type'
import type { SaveEscrowContractParams } from './save-escrow-contract.types'

const logger = new Logger()

export async function assertCanManageProjectEscrow(
	userId: string,
	projectId: string,
): Promise<{ allowed: true } | { allowed: false; error: string }> {
	const { data: profileData } = await supabaseServiceRole
		.from('profiles')
		.select('role')
		.eq('id', userId)
		.single()

	// Escrow is a platform-admin-only feature.
	if (profileData?.role === 'admin') {
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id')
			.eq('id', projectId)
			.single()

		if (projectError || !project) {
			return { allowed: false, error: 'Project not found' }
		}

		return { allowed: true }
	}

	logger.warn({
		eventType: 'ESCROW_CONTRACT_SAVE_FORBIDDEN',
		userId,
		projectId,
	})

	return {
		allowed: false,
		error: 'Forbidden: Only platform admins can manage escrow for this project',
	}
}

export async function persistEscrowContract({
	userId,
	projectId,
	contractId,
	escrowData,
	escrowType,
}: {
	userId: string
	projectId: string
	contractId: string
	escrowData: SaveEscrowContractParams['escrowData']
	escrowType?: EscrowType
}): Promise<{ success: boolean; error?: string }> {
	const supabase = supabaseServiceRole
	const engagementId = escrowData.engagementId
	const payerAddress = escrowData.roles.approver
	const platformFee = escrowData.platformFee

	const resolvedEscrowType = escrowType ?? inferEscrowTypeFromSaveData(escrowData)
	const milestones = escrowData.milestones
	let totalAmount: number
	let receiverAddress: string

	if (milestones && milestones.length > 0) {
		totalAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0)
		receiverAddress = milestones[0].receiver
	} else if (escrowData.amount !== undefined && escrowData.receiver !== undefined) {
		totalAmount = escrowData.amount
		receiverAddress = escrowData.receiver
	} else {
		logger.warn({
			eventType: 'ESCROW_CONTRACT_INVALID_PAYLOAD',
			userId,
			projectId,
		})
		return {
			success: false,
			error: 'Escrow data must include either milestones or single-release amount and receiver',
		}
	}

	const { data: existingContribution } = await supabase
		.from('contributions')
		.select('id')
		.eq('project_id', projectId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	let contributionId: string

	if (existingContribution?.id) {
		contributionId = existingContribution.id
	} else {
		const { data: newContribution, error: contribError } = await supabase
			.from('contributions')
			.insert({
				project_id: projectId,
				contributor_id: userId,
				amount: 0,
			})
			.select('id')
			.single()

		if (contribError || !newContribution?.id) {
			logger.error({
				eventType: 'ESCROW_CONTRIBUTION_CREATE_ERROR',
				error: contribError?.message ?? 'Unknown error',
				userId,
				projectId,
			})
			return {
				success: false,
				error: `Failed to create contribution record: ${contribError?.message || 'Unknown error'}`,
			}
		}

		contributionId = newContribution.id
	}

	const { data: upsertedEscrow, error: escrowUpsertError } = await supabase
		.from('escrow_contracts')
		.upsert(
			{
				contract_id: contractId,
				engagement_id: engagementId,
				project_id: projectId,
				contribution_id: contributionId,
				payer_address: payerAddress,
				receiver_address: receiverAddress,
				amount: totalAmount,
				platform_fee: platformFee,
				current_state: 'NEW',
				metadata: { escrow_type: resolvedEscrowType },
				updated_at: new Date().toISOString(),
			},
			{
				onConflict: 'contract_id',
			},
		)
		.select('id')
		.single()

	if (escrowUpsertError || !upsertedEscrow?.id) {
		logger.error({
			eventType: 'ESCROW_CONTRACT_UPSERT_ERROR',
			error: escrowUpsertError?.message ?? 'Unknown error',
			userId,
			contractId,
			projectId,
		})
		return {
			success: false,
			error: `Failed to upsert escrow contract record: ${escrowUpsertError?.message || 'Unknown error'}`,
		}
	}

	const escrowContractUuid = upsertedEscrow.id

	const { error: upsertError } = await supabase.from('project_escrows').upsert(
		{
			project_id: projectId,
			escrow_id: escrowContractUuid,
		},
		{
			onConflict: 'project_id',
		},
	)

	if (upsertError) {
		return {
			success: false,
			error: `Failed to save escrow contract: ${upsertError.message}`,
		}
	}

	logger.info({
		eventType: 'ESCROW_CONTRACT_SAVED',
		userId,
		projectId,
		contractId,
	})

	revalidatePath(`/projects/[slug]/manage/settings`)
	revalidatePath(`/projects/[slug]/manage/settings/manage`)

	return { success: true }
}
