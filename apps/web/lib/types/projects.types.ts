import type { LucideIcon } from 'lucide-react'
import { Tag } from '~/components/shared/project-card'

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
	supporters: number
	minSupport: number
	tags: Tag[] | string[]
	createdAt: string
	location?: string
}
