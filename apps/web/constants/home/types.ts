export interface ProjectTag {
	id: string
	text: string
}

export interface Project {
	id: string
	image: string
	category: string
	title: string
	description: string
	currentAmount: number
	targetAmount: number
	investors: number
	minInvestment: number
	percentageComplete: number
	tags: ProjectTag[]
}
