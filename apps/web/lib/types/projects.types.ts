import type { LucideIcon } from 'lucide-react'

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
