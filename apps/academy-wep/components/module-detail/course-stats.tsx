'use client'

import { Award, BookOpen, Clock } from 'lucide-react'

interface CourseStatsProps {
	numberOfLessons?: number
	totalDuration?: string
	stellarBadge?: string
}

export function CourseStats({
	numberOfLessons = 4,
	totalDuration = '75 min total',
	stellarBadge = 'Stellar Expert ',
}: CourseStatsProps) {
	return (
		<>
			{/* Course Stats */}
			<div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
				<div className="flex items-center gap-1 bg-gray-200 p-2 rounded-lg">
					<BookOpen className="w-4 h-4 text-[#7CC635] " />
					<span className="font-medium text-sm">{numberOfLessons} Lessons</span>
				</div>
				<div className="flex items-center gap-1 bg-gray-200 p-2 rounded-lg ">
					<Clock className="w-4 h-4 text-[#7CC635]" />
					<span className="font-medium text-sm">{totalDuration}</span>
				</div>
				<div className="flex items-center gap-1 bg-gray-200 p-2 rounded-lg">
					<Award className="w-4 h-4 text-[#7CC635]" />
					<span className="font-medium text-sm">{stellarBadge} Badge</span>
				</div>
			</div>
		</>
	)
}
