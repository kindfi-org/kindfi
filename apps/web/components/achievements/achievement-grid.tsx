import { ACHIEVEMENT_CARDS } from '~/lib/mock-data/section'
import { useState } from 'react'
import { AchievementCard } from './achievement-card'
import type { AchievementCardProps } from '~/lib/types'

export function AchievementGrid() {
	const [userAchievements, setUserAchievements] =
		useState<AchievementCardProps[]>(ACHIEVEMENT_CARDS)

	const updateAchievements = (id: string, newStatus: AchievementCardProps['status']) => {
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
					id={achievement.id}
					title={achievement.title}
					description={achievement.description}
					icon={achievement.icon}
					status={achievement.status}
					progressPercentage={achievement.progressPercentage}
				/>
			))}
		</div>
	)
}
