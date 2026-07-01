import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
	UpdateMultiReleaseEscrowPayload,
	UpdateSingleReleaseEscrowPayload,
} from '@trustless-work/escrow'
import { isSingleReleaseMilestone } from './milestone-utils'

export const MAX_ESCROW_RELEASES = 50

export type NewSingleRelease = {
	description: string
}

export type NewMultiRelease = {
	description: string
	amount: number
	receiver: string
}

export type NewRelease = NewSingleRelease | NewMultiRelease

function mapExistingSingleReleaseMilestone(milestone: SingleReleaseMilestone) {
	return {
		description: milestone.description,
		...(milestone.status ? { status: milestone.status } : {}),
		...(milestone.evidence ? { evidence: milestone.evidence } : {}),
		...(milestone.approved !== undefined ? { approved: milestone.approved } : {}),
	}
}

function mapExistingMultiReleaseMilestone(milestone: MultiReleaseMilestone) {
	return {
		description: milestone.description,
		amount: milestone.amount,
		receiver: milestone.receiver,
		...(milestone.status ? { status: milestone.status } : {}),
		...(milestone.evidence ? { evidence: milestone.evidence } : {}),
		...(milestone.flags ? { flags: milestone.flags } : {}),
	}
}

function getReceiverFromRoles(roles: GetEscrowsFromIndexerResponse['roles']): string {
	if ('receiver' in roles && typeof roles.receiver === 'string') {
		return roles.receiver
	}
	throw new Error('Escrow is missing receiver address')
}

export function buildUpdateEscrowPayload(
	escrowData: GetEscrowsFromIndexerResponse,
	escrowType: EscrowType,
	platformSigner: string,
	newRelease: NewRelease,
): UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload {
	const contractId = escrowData.contractId
	if (!contractId) {
		throw new Error('Escrow contract ID is missing')
	}

	if (platformSigner !== escrowData.roles.platformAddress) {
		throw new Error('Only the platform address can add releases to this escrow')
	}

	if (escrowData.flags?.disputed) {
		throw new Error('Cannot add releases while the escrow is in dispute')
	}

	const existingCount = escrowData.milestones.length
	if (existingCount >= MAX_ESCROW_RELEASES) {
		throw new Error(`Cannot add more than ${MAX_ESCROW_RELEASES} releases per escrow`)
	}

	const trustline = {
		symbol:
			'symbol' in escrowData.trustline &&
			typeof escrowData.trustline.symbol === 'string'
				? escrowData.trustline.symbol
				: 'USDC',
		address: escrowData.trustline.address,
	}

	if (escrowType === 'single-release') {
		const newSingle = newRelease as NewSingleRelease
		if (!newSingle.description.trim()) {
			throw new Error('Release description is required')
		}

		const existingMilestones = escrowData.milestones.filter(isSingleReleaseMilestone)

		return {
			contractId,
			signer: platformSigner,
			escrow: {
				engagementId: escrowData.engagementId,
				title: escrowData.title,
				description: escrowData.description,
				roles: {
					approver: escrowData.roles.approver,
					serviceProvider: escrowData.roles.serviceProvider,
					platformAddress: escrowData.roles.platformAddress,
					releaseSigner: escrowData.roles.releaseSigner,
					disputeResolver: escrowData.roles.disputeResolver,
					receiver: getReceiverFromRoles(escrowData.roles),
				},
				amount: escrowData.amount,
				platformFee: escrowData.platformFee,
				milestones: [
					...existingMilestones.map(mapExistingSingleReleaseMilestone),
					{ description: newSingle.description.trim() },
				],
				...(escrowData.flags ? { flags: escrowData.flags } : {}),
				...(escrowData.isActive !== undefined ? { isActive: escrowData.isActive } : {}),
				trustline,
			},
		}
	}

	const newMulti = newRelease as NewMultiRelease
	if (!newMulti.description.trim()) {
		throw new Error('Release description is required')
	}
	if (!newMulti.receiver.trim()) {
		throw new Error('Receiver address is required')
	}
	if (!Number.isFinite(newMulti.amount) || newMulti.amount <= 0) {
		throw new Error('Release amount must be greater than zero')
	}

	const existingMilestones = escrowData.milestones.filter(
		(m): m is MultiReleaseMilestone => !isSingleReleaseMilestone(m),
	)

	return {
		contractId,
		signer: platformSigner,
		escrow: {
			engagementId: escrowData.engagementId,
			title: escrowData.title,
			description: escrowData.description,
			roles: {
				approver: escrowData.roles.approver,
				serviceProvider: escrowData.roles.serviceProvider,
				platformAddress: escrowData.roles.platformAddress,
				releaseSigner: escrowData.roles.releaseSigner,
				disputeResolver: escrowData.roles.disputeResolver,
			},
			platformFee: escrowData.platformFee,
			milestones: [
				...existingMilestones.map(mapExistingMultiReleaseMilestone),
				{
					description: newMulti.description.trim(),
					amount: newMulti.amount,
					receiver: newMulti.receiver.trim(),
				},
			],
			...(escrowData.flags ? { flags: escrowData.flags } : {}),
			...(escrowData.isActive !== undefined ? { isActive: escrowData.isActive } : {}),
			trustline,
		},
	}
}
