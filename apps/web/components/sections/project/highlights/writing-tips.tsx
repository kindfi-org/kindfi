import { IoArrowForward } from 'react-icons/io5'
import { Card } from '~/components/base/card'

const WRITING_TIPS = [
	{ id: 'tip-1', label: 'Be specific with numbers and achievements' },
	{ id: 'tip-2', label: 'Focus on verified metrics and milestones' },
	{ id: 'tip-3', label: 'Highlight unique selling points' },
	{ id: 'tip-4', label: 'Include relevant partnerships or recognition' },
	{ id: 'tip-5', label: 'Quantify your impact where possible' },
] as const

export function WritingTips() {
	return (
		<Card className="bg-gray-50 p-6 border-none bg-white shadow-lg">
			<h3 className="text-xl font-semibold mb-6 md:mb-8">Writing Tips</h3>
			<div className="space-y-3">
				{WRITING_TIPS.map((tip) => (
					<div key={tip.id} className="flex gap-2 items-center">
						<IoArrowForward
							className="text-gray-500 flex-shrink-0"
							size={16}
							color="black"
						/>
						<p className="text-gray-600">{tip.label}</p>
					</div>
				))}
			</div>
		</Card>
	)
}
