'use client'

import { Sparkles } from 'lucide-react'
import { CTAButtons } from './CTAButtons'
import { NextLessonCard } from './NextLessonCard'
import { ProgressBar } from './ProgressBar'

interface LearningJourneyProps {
	completionPercentage: number
	nextLessonTitle: string
	nextLessonDescription: string
}

export default function LearningJourney({
	completionPercentage = 26,
	nextLessonTitle = 'Stellar Wallets',
	nextLessonDescription = 'Continue where you left off',
}: LearningJourneyProps) {
	return (
		<main className="p-10">
			<section
				className="w-full rounded-3xl md:px-10 py-10 px-5 shadow-lg"
				style={{
					background:
						'linear-gradient(to right, #f3f7ff 0%, #f3f7ff 10%, white 25%, white 75%, #eaf7ea 90%, #eaf7ea 100%)',
				}}
			>
				<div className="grid gap-8 lg:grid-cols-[1fr_400px]">
					<div className="space-y-6">
						{/* Tag */}
						<div className="inline-flex items-center gap-1.5 rounded-full bg-[#7CC635] bg-opacity-10 px-3 py-1 text-sm font-medium text-[#7CC635]">
							<span>
								<Sparkles size={18} />
							</span>
							<span>Learning Platform</span>
						</div>

						{/* Title */}
						<h2 className="text-4xl font-bold">
							Your Learning <span className="text-[#7CC635]">Journey</span>
						</h2>

						{/* Description */}
						<p className="text-gray-600 text-lg font-semibold">
							Discover curated resources to master blockchain, Stellar, and Web3{' '}
							<br />
							technologies for social impact.
						</p>

						{/* Progress Bar */}
						<ProgressBar percentage={completionPercentage} />

						{/* CTA Buttons */}
						<CTAButtons />
					</div>

					{/* Next Lesson Card */}
					<div className="flex items-center justify-center">
						<NextLessonCard
							title={nextLessonTitle}
							description={nextLessonDescription}
						/>
					</div>
				</div>
			</section>
		</main>
	)
}
