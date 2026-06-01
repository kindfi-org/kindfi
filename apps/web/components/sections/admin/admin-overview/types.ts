import type { IconType } from 'react-icons'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'

export type { AdminStats }

export type StatItem = {
	label: string
	value: number
	icon?: IconType
	color: string
	bgColor: string
	change?: string
}

export type MotionSectionProps = {
	stats: AdminStats
	reducedMotion: boolean | null
}
