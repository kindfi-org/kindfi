'use server'

import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import { saveEscrowContractInputSchema } from '~/lib/schemas/server-actions.schemas'
import { assertCanManageProjectEscrow, persistEscrowContract } from './persist-escrow-contract'
import type { SaveEscrowContractParams } from './save-escrow-contract.types'

const logger = new Logger()

export type { SaveEscrowContractParams }

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

	const permission = await assertCanManageProjectEscrow(userId, validated.projectId)
	if (!permission.allowed) {
		return { success: false, error: permission.error }
	}

	try {
		return await persistEscrowContract({
			userId,
			projectId: validated.projectId,
			contractId: validated.contractId,
			escrowData: validated.escrowData,
		})
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
