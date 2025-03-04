import type { LucideIcon } from 'lucide-react'

export interface RequiredItem {
	id: string
	label: string
	completed: boolean
}

export interface Tip {
	id: string
	title: string
	description: string
	action: string
	icon: LucideIcon
}

export interface Step {
	id: string
	title: string
	description: string
}
