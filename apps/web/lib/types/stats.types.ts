import type { ReactNode } from 'react'

/**
 * Interface representing a statistical item for display
 */
export interface StatItem {
	/** Unique identifier for the stat item */
	id: string
	/** Value to be displayed (e.g., "1.2M") */
	value: string
	/** Label describing the stat (e.g., "Total Users") */
	label: string
	/** Icon component to be displayed alongside the stat */
	icon: ReactNode
	/** Whether this stat should be visually highlighted */
	highlight?: boolean
	/** Background color for the stat item */
	bgColor?: string
	/** Text color for the stat item */
	textColor?: string
}
