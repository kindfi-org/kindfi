import type { LucideIcon } from 'lucide-react'

export interface Creator {
	id: number | string
	name: string
	image: string
	verified: boolean
	completedProjects: number
	role?: string
	totalRaised?: number
	followers?: number
	recentProject?: string
	totalCurrentAmount?: number
}
export interface Tag {
	id: string | number
	text: string
	color?: { backgroundColor: string; textColor: string } | string
}
export interface ProjectCategory {
	id: string
	label: string
	value: string
	icon: LucideIcon
	description?: string
}

export interface Project {
	id: number | string
	title: string
	description: string
	image_url?: string
	//for project that has the category field as an array of strings
	categories: string[]
	location?: string

	// Financial metrics
	current_amount: number
	target_amount: number
	raised?: number
	goal?: number
	min_investment: number

	// Participation metrics
	investors_count: number
	donors?: number

	// Progress tracking
	milestones?: number
	completedMilestones?: number
	percentageComplete?: number

	// Tags and categorization
	tags: Tag[] | string[]
	trending?: boolean
	featured?: boolean

	// Metadata
	created_at: string

	// Creator information
	creator?: Creator
}
