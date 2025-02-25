export interface Project {
	id: string
	title: string
	description: string
	imageUrl: string
	categories: string[]
	currentAmount: number
	goalAmount: number
	supporters: number
	minSupport: number
	tags: string[]
	createdAt: string
	location?: string
}
