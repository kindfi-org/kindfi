import type { ReactNode } from 'react'

export interface AchievementData {
	totalBadges: number
	earnedBadges: number
}

export interface AchievementProgressProps extends AchievementData {
	className?: string
}

export interface StatCardProps {
	icon: ReactNode
	iconBgColor: string
	borderColor: string
	value: number
	label: string
}
