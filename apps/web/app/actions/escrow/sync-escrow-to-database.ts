'use server'

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import { syncEscrowToDatabaseInputSchema } from '~/lib/schemas/server-actions.schemas'
import { getEscrowByContractIdFromIndexer } from '~/lib/services/escrow-indexer.service'
import { mapIndexerEscrowToSaveData } from '~/lib/utils/escrow/map-indexer-escrow-to-save-data'
import { assertCanManageProjectEscrow, persistEscrowContract } from './persist-escrow-contract'
import type { SaveEscrowContractParams } from './save-escrow-contract.types'

const logger = new Logger()

type SyncEscrowParams = {
	projectId: string
	contractId: string
	escrowSnapshot?: SaveEscrowContractParams['escrowData']
}

export async function syncEscrowToDatabaseAction(
	params: SyncEscrowParams,
): Promise<{ success: boolean; error?: string; alreadySynced?: boolean }> {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('syncEscrowToDatabaseAction')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	const userId = session.user.id

	let validated: SyncEscrowParams
	try {
		validated = validateInput(
			syncEscrowToDatabaseInputSchema,
			params,
			'syncEscrowToDatabaseAction',
		) as SyncEscrowParams
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid input')
		return { success: false, error: failure.error }
	}

	try {
		await enforceRateLimit(userId, 'sync_escrow_to_database')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return { success: false, error: failure.error }
	}

	const permission = await assertCanManageProjectEscrow(userId, validated.projectId)
	if (!permission.allowed) {
		return { success: false, error: permission.error }
	}

	try {
		const { data: projectEscrow } = await supabaseServiceRole
			.from('project_escrows')
			.select('escrow_id')
			.eq('project_id', validated.projectId)
			.maybeSingle()

		if (projectEscrow?.escrow_id) {
			const { data: linkedContract } = await supabaseServiceRole
				.from('escrow_contracts')
				.select('contract_id')
				.eq('id', projectEscrow.escrow_id)
				.maybeSingle()

			if (linkedContract?.contract_id === validated.contractId) {
				return { success: true, alreadySynced: true }
			}

			if (linkedContract?.contract_id) {
				return {
					success: false,
					error: 'This project is already linked to a different escrow contract',
				}
			}
		}

		const { data: existingContract } = await supabaseServiceRole
			.from('escrow_contracts')
			.select('project_id')
			.eq('contract_id', validated.contractId)
			.maybeSingle()

		if (existingContract && existingContract.project_id !== validated.projectId) {
			return {
				success: false,
				error: 'This contract is already linked to another project',
			}
		}

		let escrowData: SaveEscrowContractParams['escrowData']

		if (validated.escrowSnapshot) {
			escrowData = validated.escrowSnapshot
		} else {
			const indexerResult = await getEscrowByContractIdFromIndexer(validated.contractId, {
				validateOnChain: true,
			})

			if (!indexerResult.ok) {
				return {
					success: false,
					error: indexerResult.error,
				}
			}

			try {
				escrowData = mapIndexerEscrowToSaveData(indexerResult.escrow)
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Failed to map escrow data',
				}
			}
		}

		const saveResult = await persistEscrowContract({
			userId,
			projectId: validated.projectId,
			contractId: validated.contractId,
			escrowData,
		})

		if (!saveResult.success) {
			return saveResult
		}

		logger.info({
			eventType: 'ESCROW_CONTRACT_SYNCED',
			userId,
			projectId: validated.projectId,
			contractId: validated.contractId,
			source: validated.escrowSnapshot ? 'client_snapshot' : 'server_indexer',
		})

		return { success: true }
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_CONTRACT_SYNC_EXCEPTION',
			error: error instanceof Error ? error.message : 'Unknown error',
			userId,
			projectId: validated.projectId,
			contractId: validated.contractId,
		})
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to sync escrow contract',
		}
	}
}
