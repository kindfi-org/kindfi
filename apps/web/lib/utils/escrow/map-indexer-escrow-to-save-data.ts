import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import type { SaveEscrowContractParams } from '~/app/actions/escrow/save-escrow-contract.types'

type EscrowSaveData = SaveEscrowContractParams['escrowData']

const hasPaymentMilestone = (
	milestone: GetEscrowsFromIndexerResponse['milestones'][number],
): milestone is { amount: number; receiver: string } => {
	return (
		typeof milestone === 'object' &&
		milestone !== null &&
		typeof (milestone as { amount?: unknown }).amount === 'number' &&
		typeof (milestone as { receiver?: unknown }).receiver === 'string'
	)
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

	const base = {
		engagementId: escrow.engagementId,
		title: escrow.title,
		description: escrow.description,
		roles,
		platformFee: escrow.platformFee,
	}

	if (escrow.type === 'single-release') {
		const receiver = escrow.roles.receiver
		if (!receiver) {
			throw new Error('Indexer escrow is missing receiver address')
		}

		return {
			...base,
			amount: escrow.amount,
			receiver,
			...(escrow.receiverMemo !== undefined ? { receiverMemo: escrow.receiverMemo } : {}),
		}
	}

	const milestones = escrow.milestones.filter(hasPaymentMilestone).map((milestone) => ({
		amount: milestone.amount,
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
