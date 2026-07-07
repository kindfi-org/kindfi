import type {
	EscrowType,
	Flags,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
	UpdateMultiReleaseEscrowPayload,
	UpdateSingleReleaseEscrowPayload,
} from '@trustless-work/escrow'
import { getMilestoneStatus, isSingleReleaseMilestone } from './milestone-utils'
import { normalizePlatformFeeForUpdateApi } from './platform-fee'

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

function normalizeFlags(flags?: Flags): Flags | undefined {
	if (!flags) return undefined

	const normalized: Flags = {}
	if (flags.disputed) normalized.disputed = true
	if (flags.released) normalized.released = true
	if (flags.resolved) normalized.resolved = true
	if (flags.approved) normalized.approved = true

	return Object.keys(normalized).length > 0 ? normalized : undefined
}

function mapExistingSingleReleaseMilestone(milestone: SingleReleaseMilestone) {
	const mapped: UpdateSingleReleaseEscrowPayload['escrow']['milestones'][number] = {
		description: milestone.description,
	}

	if (milestone.status) {
		mapped.status = milestone.status
	}

	const evidence = milestone.evidence?.trim()
	if (evidence) {
		mapped.evidence = evidence
	}

	if (milestone.approved) {
		mapped.approved = true
	}

	return mapped
}

function mapExistingMultiReleaseMilestone(milestone: MultiReleaseMilestone) {
	const mapped: UpdateMultiReleaseEscrowPayload['escrow']['milestones'][number] = {
		description: milestone.description,
		amount: milestone.amount,
		receiver: milestone.receiver,
	}

	if (milestone.status) {
		mapped.status = milestone.status
	}

	const evidence = milestone.evidence?.trim()
	if (evidence) {
		mapped.evidence = evidence
	}

	if (milestone.flags) {
		mapped.flags = milestone.flags
	}

	return mapped
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

function buildSingleReleaseEscrowPayload(
	context: EscrowPayloadContext,
	milestones: UpdateSingleReleaseEscrowPayload['escrow']['milestones'],
): UpdateSingleReleaseEscrowPayload {
	const { escrowData, platformSigner } = context
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

	const escrowFlags = normalizeFlags(escrowData.flags)
	const receiverMemo =
		'receiverMemo' in escrowData && typeof escrowData.receiverMemo === 'number'
			? escrowData.receiverMemo
			: 0

	return {
		contractId,
		signer: platformSigner,
		escrow: {
			engagementId: escrowData.engagementId,
			title: escrowData.title,
			description: escrowData.description,
			platformFee: normalizePlatformFeeForUpdateApi(escrowData.platformFee),
			...(escrowFlags ? { flags: escrowFlags } : {}),
			trustline,
			isActive: escrowData.isActive ?? true,
			roles: {
				approver: escrowData.roles.approver,
				serviceProvider: escrowData.roles.serviceProvider,
				platformAddress: escrowData.roles.platformAddress,
				releaseSigner: escrowData.roles.releaseSigner,
				disputeResolver: escrowData.roles.disputeResolver,
				receiver: getReceiverFromRoles(escrowData.roles),
			},
			amount: escrowData.amount,
			milestones,
			...(receiverMemo !== 0 ? { receiverMemo } : {}),
		} as UpdateSingleReleaseEscrowPayload['escrow'],
	}
}

function buildMultiReleaseEscrowPayload(
	context: EscrowPayloadContext,
	milestones: UpdateMultiReleaseEscrowPayload['escrow']['milestones'],
): UpdateMultiReleaseEscrowPayload {
	const { escrowData, platformSigner } = context
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

	const escrowFlags = normalizeFlags(escrowData.flags)

	return {
		contractId,
		signer: platformSigner,
		escrow: {
			engagementId: escrowData.engagementId,
			title: escrowData.title,
			description: escrowData.description,
			platformFee: normalizePlatformFeeForUpdateApi(escrowData.platformFee),
			...(escrowFlags ? { flags: escrowFlags } : {}),
			trustline,
			...(escrowData.isActive !== undefined ? { isActive: escrowData.isActive } : {}),
			roles: {
				approver: escrowData.roles.approver,
				serviceProvider: escrowData.roles.serviceProvider,
				platformAddress: escrowData.roles.platformAddress,
				releaseSigner: escrowData.roles.releaseSigner,
				disputeResolver: escrowData.roles.disputeResolver,
			},
			milestones,
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

		return buildSingleReleaseEscrowPayload(context, [
			...existingMilestones.map(mapExistingSingleReleaseMilestone),
			{ description: newSingle.description.trim() },
		])
	}

	const newMulti = newRelease as NewMultiRelease
	validateNewMultiRelease(newMulti)

	const existingMilestones = escrowData.milestones.filter(
		(m): m is MultiReleaseMilestone => !isSingleReleaseMilestone(m),
	)

	return buildMultiReleaseEscrowPayload(context, [
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

		return buildSingleReleaseEscrowPayload(
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

	return buildMultiReleaseEscrowPayload(
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
