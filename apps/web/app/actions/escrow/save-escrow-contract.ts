'use server'

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { revalidatePath } from 'next/cache'
import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import { saveEscrowContractInputSchema } from '~/lib/schemas/server-actions.schemas'

const logger = new Logger()

interface SaveEscrowContractParams {
	projectId: string
	contractId: string
	engagementId?: string
	escrowData: {
		engagementId: string
		title: string
		description: string
		roles: {
			approver: string
			serviceProvider: string
			disputeResolver: string
			platformAddress: string
			releaseSigner: string
		}
		platformFee: number
		milestones?: Array<{
			amount: number
			receiver: string
		}>
		amount?: number
		receiver?: string
		receiverMemo?: number
	}
}

export async function saveEscrowContractAction(
	params: SaveEscrowContractParams,
): Promise<{ success: boolean; error?: string }> {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('saveEscrowContractAction')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	const userId = session.user.id

	let validated: SaveEscrowContractParams
	try {
		validated = validateInput(
			saveEscrowContractInputSchema,
			params,
			'saveEscrowContractAction',
		) as SaveEscrowContractParams
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid input')
		return { success: false, error: failure.error }
	}

	try {
		await enforceRateLimit(userId, 'save_escrow_contract')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return { success: false, error: failure.error }
	}

	try {
		const { data: profileData } = await supabaseServiceRole
			.from('profiles')
			.select('role')
			.eq('id', userId)
			.single()

		const isPlatformAdmin = profileData?.role === 'admin'

		if (!isPlatformAdmin) {
			const { data: project, error: projectError } = await supabaseServiceRole
				.from('projects')
				.select('id, kindler_id')
				.eq('id', validated.projectId)
				.single()

			if (projectError || !project) {
				return { success: false, error: 'Project not found' }
			}

			const isOwner = project.kindler_id === userId

			const { data: memberData } = await supabaseServiceRole
				.from('project_members')
				.select('role')
				.eq('project_id', validated.projectId)
				.eq('user_id', userId)
				.in('role', ['core', 'admin', 'editor'])
				.single()

			const hasEditorRole = !!memberData

			if (!isOwner && !hasEditorRole) {
				logger.warn({
					eventType: 'ESCROW_CONTRACT_SAVE_FORBIDDEN',
					userId,
					projectId: validated.projectId,
				})
				return {
					success: false,
					error: 'Forbidden: You do not have permission to update escrow for this project',
				}
			}
		}

		const supabase = supabaseServiceRole

		const { escrowData } = validated
		const engagementId = escrowData.engagementId
		// `approver` is the entity requiring the service (the funder); the
		// `serviceProvider` delivers work and receives payment. The escrow
		// payer is therefore the approver.
		const payerAddress = escrowData.roles.approver
		const platformFee = escrowData.platformFee

		const milestones = escrowData.milestones
		let totalAmount: number
		let receiverAddress: string
		if (milestones && milestones.length > 0) {
			totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0)
			// Schema guarantees every milestone shares the same receiver, so
			// reading the first is safe and represents the single receiver.
			receiverAddress = milestones[0].receiver
		} else if (escrowData.amount !== undefined && escrowData.receiver !== undefined) {
			totalAmount = escrowData.amount
			receiverAddress = escrowData.receiver
		} else {
			logger.warn({
				eventType: 'ESCROW_CONTRACT_INVALID_PAYLOAD',
				userId,
				projectId: validated.projectId,
			})
			return {
				success: false,
				error: 'Escrow data must include either milestones or single-release amount and receiver',
			}
		}

		const { data: existingContribution } = await supabase
			.from('contributions')
			.select('id')
			.eq('project_id', validated.projectId)
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
					project_id: validated.projectId,
					contributor_id: userId,
					amount: totalAmount,
				})
				.select('id')
				.single()

			if (contribError || !newContribution?.id) {
				logger.error({
					eventType: 'ESCROW_CONTRIBUTION_CREATE_ERROR',
					error: contribError?.message ?? 'Unknown error',
					userId,
					projectId: validated.projectId,
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
					contract_id: validated.contractId,
					engagement_id: engagementId,
					project_id: validated.projectId,
					contribution_id: contributionId,
					payer_address: payerAddress,
					receiver_address: receiverAddress,
					amount: totalAmount,
					platform_fee: platformFee,
					current_state: 'NEW',
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
				contractId: validated.contractId,
				projectId: validated.projectId,
			})
			return {
				success: false,
				error: `Failed to upsert escrow contract record: ${escrowUpsertError?.message || 'Unknown error'}`,
			}
		}

		const escrowContractUuid = upsertedEscrow.id

		const { error: upsertError } = await supabase.from('project_escrows').upsert(
			{
				project_id: validated.projectId,
				escrow_id: escrowContractUuid,
			},
			{
				onConflict: 'project_id',
			},
		)

		if (upsertError) {
			throw new Error(`Failed to save escrow contract: ${upsertError.message}`)
		}

		logger.info({
			eventType: 'ESCROW_CONTRACT_SAVED',
			userId,
			projectId: validated.projectId,
			contractId: validated.contractId,
		})

		revalidatePath(`/projects/[slug]/manage/settings`)
		revalidatePath(`/projects/[slug]/manage/settings/manage`)

		return {
			success: true,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_CONTRACT_SAVE_EXCEPTION',
			error: error instanceof Error ? error.message : 'Unknown error',
			userId,
		})
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to save escrow contract',
		}
	}
}
