import type { LucideIcon } from 'lucide-react'

export type DashboardMode = 'user' | 'creator'

export interface Update {
	id: string
	title: string
	timestamp: string
	description: string
}

export interface Activity {
	id: string
	title: string
	timestamp: string
	type: 'contribution' | 'referral' | 'milestone'
	icon: LucideIcon
}
