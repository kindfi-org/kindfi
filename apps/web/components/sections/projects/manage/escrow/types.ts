import type { EscrowType } from '@trustless-work/escrow'

export type MilestoneItem =
	| { id: string; description: string }
	| { id: string; description: string; amount: number | ''; receiver: string }

export interface EscrowFormData {
	selectedEscrowType: EscrowType
	title: string
	engagementId: string
	trustlineAddress: string
	approver: string
	serviceProvider: string
	releaseSigner: string
	disputeResolver: string
	platformAddress: string
	receiver: string
	platformFee: number | ''
	amount: number | ''
	receiverMemo: string
	description: string
	milestones: MilestoneItem[]
}

export interface EscrowAdminPanelProps {
	projectId: string
	projectSlug: string
	projectTitle?: string
	projectDescription?: string
	escrowContractAddress?: string
	escrowType?: EscrowType
}
