import { achievements } from '~/lib/mock-data/section'
import { useState } from 'react'
import { AchievementCard } from './achievement-card'

import type { AchievementCardProps } from '~/lib/types'

interface Achievement extends Omit<AchievementCardProps, 'status'> {
	id: string
	description: string
	icon: React.ReactNode
	status: 'locked' | 'in-progress' | 'completed'
}

export function AchievementGrid() {
	const [userAchievements, setUserAchievements] =
		useState<Achievement[]>(achievements)

	const updateAchievements = (id: string, newStatus: Achievement['status']) => {
		setUserAchievements((prev) =>
			prev.map((achievement) => {
				if (achievement.id === id) {
					return {
						...achievement,
						status: newStatus,
						progressPercentage: newStatus === 'in-progress' ? 50 : undefined,
					}
				}
				return achievement
			}),
		)
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{userAchievements.map((achievement) => (
				<AchievementCard
					key={achievement.id}
					title={achievement.title}
					subtitle={achievement.description}
					icon={achievement.icon}
					status={achievement.status}
					progressPercentage={achievement.progressPercentage}
					onClick={() => {
						// TODO: handle achievement click (e.g., open details)
					}}
				/>
			))}
		</div>
	)
}
