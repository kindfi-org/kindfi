import type { LucideIcon } from 'lucide-react'

export interface NavigationRoute {
	name: string
	href: string
	icon: LucideIcon
}

export interface LearningPathSubItem {
	name: string
	href: string
}

export interface LearningPath {
	name: string
	icon: string
	href: string
	subItems: LearningPathSubItem[]
}
