import type { GetEscrowsFromIndexerResponse, MultiReleaseMilestone } from '@trustless-work/escrow'
import type { SaveEscrowContractParams } from '~/app/actions/escrow/save-escrow-contract.types'
import { KINDFI_PLATFORM_FEE_PERCENT } from '~/lib/utils/escrow/platform-fee'

type EscrowSaveData = SaveEscrowContractParams['escrowData']

const toPositiveNumber = (value: unknown): number | null => {
	const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return null
	}

	return parsed
}

const hasPaymentMilestone = (
	milestone: GetEscrowsFromIndexerResponse['milestones'][number],
): milestone is MultiReleaseMilestone => {
	if (typeof milestone !== 'object' || milestone === null) {
		return false
	}

	if (!('amount' in milestone) || !('receiver' in milestone)) {
		return false
	}

	return toPositiveNumber(milestone.amount) !== null && typeof milestone.receiver === 'string'
}

export const mapIndexerEscrowToSaveData = (
	escrow: GetEscrowsFromIndexerResponse,
): EscrowSaveData => {
	const roles = {
		approver: escrow.roles.approver,
		serviceProvider: escrow.roles.serviceProvider,
		disputeResolver: escrow.roles.disputeResolver,
		platformAddress: escrow.roles.platformAddress,
		releaseSigner: escrow.roles.releaseSigner,
	}

	const title = escrow.title?.trim() || 'Untitled Escrow'
	const description = escrow.description?.trim() || title

	const base = {
		engagementId: escrow.engagementId,
		title,
		description,
		roles,
		platformFee: KINDFI_PLATFORM_FEE_PERCENT,
	}

	if (escrow.type === 'single-release') {
		const receiver = 'receiver' in escrow.roles ? escrow.roles.receiver : undefined
		if (!receiver) {
			throw new Error('Indexer escrow is missing receiver address')
		}

		const amount = toPositiveNumber(escrow.amount)
		if (amount === null) {
			throw new Error('Indexer escrow is missing a positive amount')
		}

		return {
			...base,
			amount,
			receiver,
		}
	}

	const milestones = escrow.milestones.filter(hasPaymentMilestone).map((milestone) => ({
		amount: toPositiveNumber(milestone.amount) as number,
		receiver: milestone.receiver,
	}))

	if (milestones.length === 0) {
		throw new Error('Multi-release escrow has no payment milestones in indexer data')
	}

	return {
		...base,
		milestones,
	}
}
