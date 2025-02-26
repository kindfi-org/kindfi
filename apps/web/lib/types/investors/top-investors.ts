export interface Category {
	icon: string
	name: string
}

export interface RecentProject {
	name: string
	amount: string
}

export interface Investor {
	id: number
	name: string
	verified: boolean
	level: string
	levelClass: string
	image: string
	totalImpact: string
	projectsSupported: number
	followers: string
	categories: Category[]
	recentProjects: RecentProject[]
}
