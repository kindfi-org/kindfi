import type { LucideIcon } from 'lucide-react'
import type { Tag } from '~/components/shared/project-card'
import type { Creator } from './featured-projects/featured-projects.types'

export interface ProjectCategory {
	id: string
	label: string
	value: string
	icon: LucideIcon
	description?: string
}

export interface Project {
	id: string
	title: string
	description: string
	image: string
	categories: string[]
	currentAmount: number
	targetAmount: number
	investors: number
	milestones: number
	completedMilestones: number
	minimumSupport: number
	creator: Creator
	category: string
	tags: Tag[] | string[]
	createdAt: string
	location?: string
	trending: boolean
	featured: boolean
	percentageComplete?: number
	minInvestment?: number
}
