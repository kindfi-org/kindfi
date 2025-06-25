'use client'

import { ArrowLeft } from 'lucide-react'

import Link from 'next/link'
import { CourseStats } from './course-stats'
import { NextLessonCard } from './next-lesson-card'
import { ProgressBar } from './progress-bar'

interface ModuleHeaderProps {
	completionPercentage?: number
	nextLessonTitle?: string
	nextLessonDescription?: string
}

export default function ModuleHeader({
	completionPercentage = 50,
	nextLessonTitle = 'Stellar Blockchain Basics',
	nextLessonDescription = 'Understand the Stellar network, consensus mechanism, and ecosystem',
}: ModuleHeaderProps) {
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
						<Link
							href="/modules"
							className="inline-flex items-center gap-1.5 cursor-pointer rounded-full bg-[#7CC635]  border-gray-300 hover:border-[#7CC635]  border bg-opacity-10  px-3 py-1 text-sm font-medium text-black hover:text-[#7CC635] transition-all"
						>
							<span>
								<ArrowLeft size={18} />
							</span>
							<span>Back to Modules</span>
						</Link>

						{/* Title */}
						<h2 className="text-4xl font-bold">{nextLessonTitle}</h2>

						{/* Description */}
						<p className="text-gray-600 text-lg font-semibold">
							{nextLessonDescription}
						</p>

						{/* Progress Bar */}
						<ProgressBar percentage={completionPercentage} />

						{/* CTA Buttons */}
						<CourseStats />
					</div>

					{/* Next Lesson Card */}
					<div className="flex items-center justify-center">
						<NextLessonCard />
					</div>
				</div>
			</section>
		</main>
	)
}
