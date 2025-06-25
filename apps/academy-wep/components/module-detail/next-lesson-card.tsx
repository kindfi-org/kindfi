'use client'

import { Play } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'

interface NextLessonCardProps {
	onStartLesson?: () => void
}

export function NextLessonCard({
	onStartLesson = () => {},
}: NextLessonCardProps) {
	return (
		<Card className="w-[22rem] rounded-2xl border-0 bg-white shadow-md">
			<CardContent className="px-6 py-8">
				<div className="space-y-4">
					<div className="flex gap-4">
						<div className="flex w-16  items-center justify-center rounded-lg bg-[#7CC635] bg-opacity-20 ">
							<Play className="size-8 text-[#7CC635]" />
						</div>

						<div className="space-y-1">
							<h3 className="text-2xl font-semibold">Continue Learning</h3>
							<p
								className="text-xl font-semibold text-slate-500"
								aria-label="Start next lesson"
							>
								Start Next Lesson
							</p>
						</div>
					</div>

					<Button
						onClick={onStartLesson}
						className="w-full bg-gradient-to-r from-[#7CC635] to-black text-white hover:bg-slate-800 text-xl py-7"
					>
						Start Next Lesson <span className="ml-1">➔</span>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
