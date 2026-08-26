export interface SaveEscrowContractParams {
	projectId: string
	contractId: string
	engagementId?: string
	escrowData: {
		engagementId: string
		title: string
		description: string
		roles: {
			approver: string
			serviceProvider: string
			disputeResolver: string
			platformAddress: string
			releaseSigner: string
		}
		platformFee: number
		milestones?: Array<{
			amount: number
			receiver: string
		}>
		amount?: number
		receiver?: string
		receiverMemo?: number
	}
}
