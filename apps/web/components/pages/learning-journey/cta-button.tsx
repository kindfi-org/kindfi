'use client'

import { Button } from '../../base/button'

interface CTAButtonsProps {
	onContinueLearning?: () => void
	onViewBadges?: () => void
}

export function CTAButtons({
	onContinueLearning = () => {},
	onViewBadges = () => {},
}: CTAButtonsProps) {
	return (
		<div className="flex flex-wrap gap-4">
			<Button
				onClick={onContinueLearning}
				className="bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
			>
				Continue Learning
			</Button>

			<Button
				onClick={onViewBadges}
				variant="outline"
				className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
			>
				View Badges
			</Button>
		</div>
	)
}
