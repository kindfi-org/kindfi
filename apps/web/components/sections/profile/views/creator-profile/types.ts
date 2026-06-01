export interface CreatorProfileProps {
	userId: string
	displayName: string
	showSection?: string
}

export type CreatorProjectWithBalance = {
	id: string
	title: string
	slug: string | null
	description: string | null
	image: string | null
	raised: number
	goal: number
	percentageComplete: number | null
	status: string
	tags: Array<{ name: string; color: string | null }>
	escrowContractAddress?: string | null
}
