'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '~/components/base/button'

interface CTAButtonsProps {
	onContinueLearning?: () => void
	onViewBadges?: () => void
}

export function CTAButtons({
	onContinueLearning = () => {},
	onViewBadges = () => {},
}: CTAButtonsProps) {
	return (
		<div className="flex flex-wrap gap-4 items-center">
			<Button
				onClick={onContinueLearning}
				size="lg"
				variant="gradient-green"
				className=" w-52 px-6 py-6  text-base rounded-sm shadow-md hover:shadow-lg transition-all duration-300 "
			>
				Continue Learning
				<ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
			</Button>

			<Button
				onClick={onViewBadges}
				variant="outline"
				className="border-[#7CC635] text-[#7CC635] w-40 px-2 py-[23px] text-base rounded-sm hover:bg-green-50 "
			>
				View Badges
			</Button>
		</div>
	)
}
