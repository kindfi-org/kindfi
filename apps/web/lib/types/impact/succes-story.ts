export interface SuccessStory {
	id: string
	title: string
	location: string
	image: string
	donors: number
	milestones: {
		completed: number
		total: number
	}
	raised: number
	target: number
}
