export interface Creator {
	id: number
	name: string
	image: string
	verified: boolean
	completedProjects: number
	role?: string
	totalRaised?: number
	followers?: number
	recentProject?: string
}

export interface Project {
	id: number
	title: string
	description: string
	location: string
	raised: number
	goal: number
	donors: number
	image: string
	category: string
	milestones: number
	completedMilestones: number
	creator: Creator
	trending: boolean
	featured: boolean
}
