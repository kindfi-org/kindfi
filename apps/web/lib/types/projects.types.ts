import type { LucideIcon } from 'lucide-react'

export interface ProjectCategory {
	id: string
	label: string
	value: string
	icon: LucideIcon
	description?: string
}
