import type { CreatedAt, UpdatedAt } from '../date.types'

export type MilestoneStatus = 'completed' | 'approved' | 'pending'

export type Milestone = {
	description: string
	status?: MilestoneStatus
	flag?: boolean
}
export interface Escrow {
	id: string
	title: string
	description: string
	createdAt: CreatedAt
	updatedAt: UpdatedAt
	contractId?: string
	balance?: string
	token: string
	milestones: Milestone[]
	serviceProvider: string
	engagementId: string
	disputeResolver: string
	amount: string
	platformAddress: string
	platformFee: string
	approver: string
	releaseSigner: string
	user: string
	issuer: string
	disputeFlag?: boolean
	releaseFlag?: boolean
	resolvedFlag?: boolean
}
