export interface DonorProfileProps {
	userId: string
	displayName: string
	showSection?: string
}

export type DonorProjectWithBalance = {
	id: string
	title: string
	slug: string
	description: string | null
	image: string | null
	raised: number
	goal: number
	percentageComplete: number | null
	status: string
	tags: Array<{ name: string; color: string | null }>
	contributionAmount: string | number
	contributionDate: string | null
	escrowContractAddress?: string | null
}

export type DonorDonationHistoryItem = {
	id: string
	title: string
	slug: string
	description?: string | null
	contributionAmount: string | number
	contributionDate: string | null
}
