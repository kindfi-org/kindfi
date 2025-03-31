'use client'

import { BookOpen } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { ProgressBar } from './ProgressBar'

interface NextLessonCardProps {
	title: string
	description: string
	onStartLesson?: () => void
}

export function NextLessonCard({
	title,
	description,
	onStartLesson = () => {},
}: NextLessonCardProps) {
	return (
		<Card className="w-full rounded-2xl border-0 bg-white shadow-md">
			<CardContent className="px-6 py-8">
				<div className="space-y-4">
					<div className="flex gap-4">
						<div className="flex w-16  items-center justify-center rounded-lg bg-[#7CC635] bg-opacity-20 ">
							<BookOpen className="size-8 text-[#7CC635]" />
						</div>

						<div className="space-y-1">
							<h3 className="text-2xl font-semibold">Next up: {title}</h3>
							<p className="text-xl font-semibold text-slate-500">
								{description}
							</p>
						</div>
					</div>

					<ProgressBar percentage={30} showLabel={false} size="sm" />

					<Button
						onClick={onStartLesson}
						className="w-full bg-black text-white hover:bg-slate-800 text-xl py-7"
					>
						Start Next Lesson <span className="ml-1">➔</span>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
