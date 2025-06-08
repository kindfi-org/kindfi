import type { ReviewStatus } from '~/lib/types/escrow/escrow-reviews.types'
import type { Enums } from '../database.types'
import type { CreatedAt, UpdatedAt } from '../date.types'

// Re-export the types from Supabase service with appropriate names
export type MilestoneStatusType = Enums<'milestone_status'>
export type DisputeStatus = ReviewStatus // Using the ReviewStatus from Supabase service

export type Milestone = {
	description: string
	status?: MilestoneStatusType
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
