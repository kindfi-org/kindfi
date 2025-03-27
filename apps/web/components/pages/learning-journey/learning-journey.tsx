'use client'
import { CTAButtons } from './cta-button'
import { NextLessonCard } from './next-lesson-card'
import { ProgressBar } from './progress-bar'

interface LearningJourneyProps {
	completionPercentage: number
	nextLessonTitle: string
	nextLessonDescription: string
}

export function LearningJourney({
	completionPercentage = 26,
	nextLessonTitle = 'Stellar Wallets',
	nextLessonDescription = 'Continue where you left off',
}: LearningJourneyProps) {
	return (
		<section className="w-full rounded-3xl bg-slate-50 p-8 shadow-lg">
			<div className="grid gap-8 lg:grid-cols-[1fr_350px]">
				<div className="space-y-6">
					{/* Tag */}
					<div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-600">
						<span className="size-4">✦</span>
						<span>Learning Platform</span>
					</div>

					{/* Title */}
					<h2 className="text-4xl font-bold">
						Your Learning <span className="text-green-600">Journey</span>
					</h2>

					{/* Description */}
					<p className="text-slate-600">
						Discover curated resources to master blockchain, Stellar, and Web3
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
	)
}
