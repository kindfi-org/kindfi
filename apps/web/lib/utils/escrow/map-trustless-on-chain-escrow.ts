import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'

const firstRole = (roles: string[] | undefined): string => roles?.[0] ?? ''

type V2RoleBundle = {
	approvers?: string[]
	serviceProviders?: string[]
	platform?: string
	releaseSigners?: string[]
	disputeResolvers?: string[]
	receiver?: string
}

const mapV2Roles = (roles: V2RoleBundle) => ({
	approver: firstRole(roles.approvers),
	serviceProvider: firstRole(roles.serviceProviders),
	disputeResolver: firstRole(roles.disputeResolvers),
	platformAddress: roles.platform ?? '',
	releaseSigner: firstRole(roles.releaseSigners),
	...(roles.receiver ? { receiver: roles.receiver } : {}),
})

type SingleReleaseV2Escrow = {
	type?: string
	contractId: string
	engagementId: string
	title: string
	description: string
	amount: number
	platformFee: number
	roles: V2RoleBundle
	milestones?: unknown[]
}

type MultiReleaseV2Milestone = {
	description?: string
	amount?: number
	receiver?: string
}

type MultiReleaseV2Escrow = {
	type?: string
	contractId: string
	engagementId: string
	title: string
	description: string
	platformFee: number
	roles: V2RoleBundle
	milestones?: MultiReleaseV2Milestone[]
	amount?: number
}

export const mapSingleReleaseV2EscrowToIndexer = (
	escrow: SingleReleaseV2Escrow,
): GetEscrowsFromIndexerResponse => {
	return {
		type: 'single-release',
		contractId: escrow.contractId,
		engagementId: escrow.engagementId,
		title: escrow.title,
		description: escrow.description,
		amount: escrow.amount,
		platformFee: escrow.platformFee,
		roles: mapV2Roles(escrow.roles),
		milestones: Array.isArray(escrow.milestones) ? escrow.milestones : [],
	} as GetEscrowsFromIndexerResponse
}

export const mapMultiReleaseV2EscrowToIndexer = (
	escrow: MultiReleaseV2Escrow,
): GetEscrowsFromIndexerResponse => {
	const milestones = (escrow.milestones ?? [])
		.filter(
			(milestone): milestone is MultiReleaseV2Milestone & { amount: number; receiver: string } =>
				typeof milestone.amount === 'number' &&
				milestone.amount > 0 &&
				typeof milestone.receiver === 'string',
		)
		.map((milestone) => ({
			amount: milestone.amount,
			receiver: milestone.receiver,
			description: milestone.description ?? '',
		}))

	return {
		type: 'multi-release',
		contractId: escrow.contractId,
		engagementId: escrow.engagementId,
		title: escrow.title,
		description: escrow.description,
		amount: escrow.amount ?? milestones.reduce((sum, milestone) => sum + milestone.amount, 0),
		platformFee: escrow.platformFee,
		roles: mapV2Roles(escrow.roles),
		milestones,
	} as GetEscrowsFromIndexerResponse
}
