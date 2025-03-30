'use client'

import type React from 'react'
import { AchievementCard } from './shared/achivement-card'
import { achievements } from '~/data/achivement-data'


const AchievementsPage: React.FC = () => {
	return (
		<div className="bg-white min-h-screen p-8">
			<div className=" mx-auto">
				<h1 className="text-2xl font-bold mb-6 text-gray-800">
					Your Achievement Collection
				</h1>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{achievements.map((achievement) => (
						<AchievementCard
							key={`${achievement.title.toLowerCase().replace(/\s+/g, '-')}`}
							{...achievement}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export { AchievementsPage }
