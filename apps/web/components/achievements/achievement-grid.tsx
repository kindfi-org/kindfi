import { achievements } from '@/lib/mock-data/section'
import { useState } from 'react'
import { AchievementCard } from './achievement-card'

interface Achievement {
	id: string
	title: string
	description: string
	icon: React.ReactNode
	status: 'locked' | 'in-progress' | 'completed'
	progressPercentage?: number
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
					description={achievement.description}
					icon={achievement.icon}
					status={achievement.status}
					progressPercentage={achievement.progressPercentage}
				/>
			))}
		</div>
	)
}
