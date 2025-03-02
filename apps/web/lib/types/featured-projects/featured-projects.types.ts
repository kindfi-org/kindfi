export interface Creator {
	id: number
	name: string
	image: string
	verified: boolean
	completedProjects: number
	totalcurrentAmount?: number
	role?: string
	totalRaised?: number
	followers?: number
	recentProject?: string
}

export interface Project {
	id: number
	title: string
	description: string
	image?: string
	location?: string
	category: string
	currentAmount?: number
	targetAmount?: number
	investors?: number
	minInvestment?: number
	percentageComplete?: number
	tags: string[]
	raised: number
	goal: number
	donors?: number
	milestones?: number
	completedMilestones?: number
	trending?: boolean
	featured?: boolean
	creator: Creator
}
