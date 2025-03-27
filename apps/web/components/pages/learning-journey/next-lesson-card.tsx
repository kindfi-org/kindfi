'use client'

import { Book } from 'lucide-react'
import { Button } from '../../base/button'
import { Card, CardContent } from '../../base/card'
import { ProgressBar } from './progress-bar'

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
		<Card className="w-full max-w-md overflow-hidden rounded-2xl border-0 bg-white shadow-md">
			<CardContent className="p-6">
				<div className="space-y-4">
					<div className="flex items-start gap-4">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-100">
							<Book className="size-5 text-green-600" />
						</div>

						<div className="space-y-1">
							<h3 className="text-lg font-semibold">Next up: {title}</h3>
							<p className="text-sm text-slate-500">{description}</p>
						</div>
					</div>

					<ProgressBar percentage={30} showLabel={false} size="sm" />

					<Button
						onClick={onStartLesson}
						className="w-full bg-black text-white hover:bg-slate-800"
					>
						Start Next Lesson <span className="ml-1">➔</span>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
