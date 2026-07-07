import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
	UpdateMultiReleaseEscrowPayload,
	UpdateSingleReleaseEscrowPayload,
} from '@trustless-work/escrow'
import { getMilestoneStatus, isSingleReleaseMilestone } from './milestone-utils'

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

export type EditRelease = NewRelease

type EscrowPayloadContext = {
	escrowData: GetEscrowsFromIndexerResponse
	escrowType: EscrowType
	platformSigner: string
}

function mapExistingSingleReleaseMilestone(milestone: SingleReleaseMilestone) {
	return {
		description: milestone.description,
		...(milestone.status ? { status: milestone.status } : {}),
		evidence: milestone.evidence ?? '',
		...(milestone.approved !== undefined ? { approved: milestone.approved } : {}),
	}
}

function mapExistingMultiReleaseMilestone(milestone: MultiReleaseMilestone) {
	return {
		description: milestone.description,
		amount: milestone.amount,
		receiver: milestone.receiver,
		...(milestone.status ? { status: milestone.status } : {}),
		evidence: milestone.evidence ?? '',
		...(milestone.flags ? { flags: milestone.flags } : {}),
	}
}

function getReceiverFromRoles(roles: GetEscrowsFromIndexerResponse['roles']): string {
	if ('receiver' in roles && typeof roles.receiver === 'string') {
		return roles.receiver
	}
	throw new Error('Escrow is missing receiver address')
}

function assertPlatformCanUpdateEscrow(
	escrowData: GetEscrowsFromIndexerResponse,
	platformSigner: string,
) {
	if (platformSigner !== escrowData.roles.platformAddress) {
		throw new Error('Only the platform address can update releases on this escrow')
	}

	if (escrowData.flags?.disputed) {
		throw new Error('Cannot update releases while the escrow is in dispute')
	}
}

function assertMilestoneNotApproved(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
	milestoneIndex: number,
) {
	if (getMilestoneStatus(milestone)) {
		throw new Error(`Release ${milestoneIndex + 1} is already approved and cannot be edited`)
	}
}

export function getMilestoneEditBlockReason(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): string | null {
	if (getMilestoneStatus(milestone)) {
		return 'This release is already approved and cannot be edited.'
	}

	if (!isSingleReleaseMilestone(milestone)) {
		if (milestone.flags?.disputed) {
			return 'This release is in dispute and cannot be edited.'
		}
		if (milestone.flags?.released) {
			return 'This release has already been disbursed and cannot be edited.'
		}
	}

	return null
}

export function isMilestoneEditable(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): boolean {
	return getMilestoneEditBlockReason(milestone) === null
}

function buildEscrowPayloadBase(
	context: EscrowPayloadContext,
	milestones:
		| UpdateSingleReleaseEscrowPayload['escrow']['milestones']
		| UpdateMultiReleaseEscrowPayload['escrow']['milestones'],
): UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload {
	const { escrowData, escrowType, platformSigner } = context
	const contractId = escrowData.contractId
	if (!contractId) {
		throw new Error('Escrow contract ID is missing')
	}

	const trustline = {
		symbol:
			'symbol' in escrowData.trustline && typeof escrowData.trustline.symbol === 'string'
				? escrowData.trustline.symbol
				: 'USDC',
		address: escrowData.trustline.address,
	}

	const sharedEscrowFields = {
		engagementId: escrowData.engagementId,
		title: escrowData.title,
		description: escrowData.description,
		platformFee: escrowData.platformFee,
		...(escrowData.flags ? { flags: escrowData.flags } : {}),
		...(escrowData.isActive !== undefined ? { isActive: escrowData.isActive } : {}),
		trustline,
	}

	if (escrowType === 'single-release') {
		return {
			contractId,
			signer: platformSigner,
			escrow: {
				...sharedEscrowFields,
				roles: {
					approver: escrowData.roles.approver,
					serviceProvider: escrowData.roles.serviceProvider,
					platformAddress: escrowData.roles.platformAddress,
					releaseSigner: escrowData.roles.releaseSigner,
					disputeResolver: escrowData.roles.disputeResolver,
					receiver: getReceiverFromRoles(escrowData.roles),
				},
				amount: escrowData.amount,
				milestones: milestones as UpdateSingleReleaseEscrowPayload['escrow']['milestones'],
			},
		}
	}

	return {
		contractId,
		signer: platformSigner,
		escrow: {
			...sharedEscrowFields,
			roles: {
				approver: escrowData.roles.approver,
				serviceProvider: escrowData.roles.serviceProvider,
				platformAddress: escrowData.roles.platformAddress,
				releaseSigner: escrowData.roles.releaseSigner,
				disputeResolver: escrowData.roles.disputeResolver,
			},
			milestones: milestones as UpdateMultiReleaseEscrowPayload['escrow']['milestones'],
		},
	}
}

function validateNewMultiRelease(newMulti: NewMultiRelease) {
	if (!newMulti.description.trim()) {
		throw new Error('Release description is required')
	}
	if (!newMulti.receiver.trim()) {
		throw new Error('Receiver address is required')
	}
	if (!Number.isFinite(newMulti.amount) || newMulti.amount <= 0) {
		throw new Error('Release amount must be greater than zero')
	}
}

function validateNewSingleRelease(newSingle: NewSingleRelease) {
	if (!newSingle.description.trim()) {
		throw new Error('Release description is required')
	}
}

export function buildUpdateEscrowPayload(
	escrowData: GetEscrowsFromIndexerResponse,
	escrowType: EscrowType,
	platformSigner: string,
	newRelease: NewRelease,
): UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload {
	assertPlatformCanUpdateEscrow(escrowData, platformSigner)

	const existingCount = escrowData.milestones.length
	if (existingCount >= MAX_ESCROW_RELEASES) {
		throw new Error(`Cannot add more than ${MAX_ESCROW_RELEASES} releases per escrow`)
	}

	const context: EscrowPayloadContext = { escrowData, escrowType, platformSigner }

	if (escrowType === 'single-release') {
		const newSingle = newRelease as NewSingleRelease
		validateNewSingleRelease(newSingle)

		const existingMilestones = escrowData.milestones.filter(isSingleReleaseMilestone)

		return buildEscrowPayloadBase(context, [
			...existingMilestones.map(mapExistingSingleReleaseMilestone),
			{ description: newSingle.description.trim() },
		])
	}

	const newMulti = newRelease as NewMultiRelease
	validateNewMultiRelease(newMulti)

	const existingMilestones = escrowData.milestones.filter(
		(m): m is MultiReleaseMilestone => !isSingleReleaseMilestone(m),
	)

	return buildEscrowPayloadBase(context, [
		...existingMilestones.map(mapExistingMultiReleaseMilestone),
		{
			description: newMulti.description.trim(),
			amount: newMulti.amount,
			receiver: newMulti.receiver.trim(),
		},
	])
}

export function buildEditReleasePayload(
	escrowData: GetEscrowsFromIndexerResponse,
	escrowType: EscrowType,
	platformSigner: string,
	milestoneIndex: number,
	editedRelease: EditRelease,
): UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload {
	assertPlatformCanUpdateEscrow(escrowData, platformSigner)

	if (milestoneIndex < 0 || milestoneIndex >= escrowData.milestones.length) {
		throw new Error('Invalid release index')
	}

	const milestone = escrowData.milestones[milestoneIndex]
	assertMilestoneNotApproved(milestone, milestoneIndex)

	const context: EscrowPayloadContext = { escrowData, escrowType, platformSigner }

	if (escrowType === 'single-release') {
		if (!isSingleReleaseMilestone(milestone)) {
			throw new Error('Release type mismatch for single-release escrow')
		}

		const editedSingle = editedRelease as NewSingleRelease
		validateNewSingleRelease(editedSingle)

		const existingMilestones = escrowData.milestones.filter(isSingleReleaseMilestone)

		return buildEscrowPayloadBase(
			context,
			existingMilestones.map((existing, index) =>
				index === milestoneIndex
					? {
							...mapExistingSingleReleaseMilestone(existing),
							description: editedSingle.description.trim(),
						}
					: mapExistingSingleReleaseMilestone(existing),
			),
		)
	}

	if (isSingleReleaseMilestone(milestone)) {
		throw new Error('Release type mismatch for multi-release escrow')
	}

	const editedMulti = editedRelease as NewMultiRelease
	validateNewMultiRelease(editedMulti)

	const existingMilestones = escrowData.milestones.filter(
		(m): m is MultiReleaseMilestone => !isSingleReleaseMilestone(m),
	)

	return buildEscrowPayloadBase(
		context,
		existingMilestones.map((existing, index) =>
			index === milestoneIndex
				? {
						...mapExistingMultiReleaseMilestone(existing),
						description: editedMulti.description.trim(),
						amount: editedMulti.amount,
						receiver: editedMulti.receiver.trim(),
					}
				: mapExistingMultiReleaseMilestone(existing),
		),
	)
}
