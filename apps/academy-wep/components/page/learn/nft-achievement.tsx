'use client'

import { NFTAchievementProgress } from '~/components/learn/nft-achievement-progress'
import { NFTAchievementStats } from '~/components/learn/nft-achievement-stats'
import { achievementData } from '~/lib/mock-data/learn/mock-nft-achievement'

export function NFTAchievement() {
	// Use the mock data from our separate file
	const { totalBadges, earnedBadges } = achievementData

	return (
		<div className="bg-blue-50 rounded-xl p-6 md:p-8 relative overflow-hidden">
			<h3 className="text-2xl font-bold text-gray-900 mb-2">
				Your Badge Collection
			</h3>
			<p className="text-gray-600 mb-8 max-w-3xl">
				Track your progress as you earn badges by completing learning modules.
				Each badge represents mastery of a blockchain concept.
			</p>

			{/* Progress Bar and Badge Counter */}
			<NFTAchievementProgress
				totalBadges={totalBadges}
				earnedBadges={earnedBadges}
				className="mb-10"
			/>

			{/* Stats Grid */}
			<NFTAchievementStats
				totalBadges={totalBadges}
				earnedBadges={earnedBadges}
			/>
		</div>
	)
}
