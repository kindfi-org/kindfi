'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '~/components/base/button'

interface CTAButtonsProps {
	onWorkshopClick?: () => void
	onSubscribeClick?: () => void
}

export function CTAButtons({
	onWorkshopClick,
	onSubscribeClick,
}: CTAButtonsProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
			<Button
				onClick={onWorkshopClick}
				size="lg"
				variant="gradient-green"
				className="gap-2 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full"
			>
				Join Free Workshop
				<ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
			</Button>
			<Button
				onClick={onSubscribeClick}
				variant="outline"
				size="lg"
				className="border-gray-300 bg-white text-gray-700 hover:border-[#7CC635] hover:text-[#7CC635] hover:bg-[#f0f9e8] px-4 py-3 gap-2 rounded-xl transition-all duration-300 w-full"
			>
				Subscribe to Updates
			</Button>
		</div>
	)
}
