export type KycStatusRow = {
	id: string
	user: string
	status: 'approved' | 'pending' | 'rejected'
	requestedAt: string
}
