import type { ReactNode } from 'react'

export interface StatItem {
	id: string
	value: string
	label: string
	icon: ReactNode
	highlight?: boolean
}
