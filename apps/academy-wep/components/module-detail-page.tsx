import type React from 'react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { ProgressBar } from '~/components/base/progress-bar'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/base/tooltip'

import { CheckCircle, Lock, PlayCircle } from 'lucide-react'

interface Lesson {
	id: number
	title: string
	description: string
	estimatedTime: string
	status: 'completed' | 'ready' | 'locked'
}

interface ModuleDetailPageProps {
	title: string
	description: string
	progress: number
	totalLessons: number
	estimatedTime: string
	badge: string
	nextLesson: Lesson
	lessons: Lesson[]
}

const ModuleDetailPage: React.FC<ModuleDetailPageProps> = ({
	title,
	description,
	progress,
	totalLessons,
	estimatedTime,
	badge,
	nextLesson,
	lessons,
}) => {
	// Early return for missing data
	if (!lessons || lessons.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
				<p className="text-lg text-gray-600 mb-4">
					No lessons are available for this module yet.
				</p>
			</div>
		)
	}

	// ? Here we can sort the lessons by any other parameter, such as "createdAt" or "updatedAt"
	// ? but for this example, we will sort them by "id"
	const sortedLessons = lessons.sort((a, b) => a.id - b.id)

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Module Header Section - Displays the title, description, badge, and progress bar */}
			<section className="mb-8">
				<div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
						<p className="text-lg text-gray-600 mb-4">{description}</p>

						<div className="flex items-center gap-4 mb-4">
							<Badge variant="default" className="text-sm">
								Earn: {badge}
							</Badge>
							<span className="text-sm text-gray-500">
								{totalLessons} lessons • {estimatedTime}
							</span>
						</div>
					</div>

					<div className="w-full md:w-64">
						<ProgressBar
							value={progress}
							aria-label={`Module progress: ${progress}% completed`}
						/>
						<p className="text-sm text-gray-500 mt-2 text-right">
							{progress}% completed
						</p>
					</div>
				</div>
			</section>

			{/* Continue Learning Card - Encourages users to start the next lesson */}
			<section className="mb-10">
				<Card className="p-6 bg-gradient-to-r from-kindBlue-50 to-kindGreen-50 border-kindBlue-200">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Continue Learning
					</h2>
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div>
							<h3 className="font-medium text-gray-800">{nextLesson.title}</h3>
							<p className="text-sm text-gray-500 mt-1">
								Estimated time: {nextLesson.estimatedTime}
							</p>
						</div>
						<Button
							variant="default"
							className="w-full md:w-auto"
							onClick={() =>
								console.log(`Starting lesson: ${nextLesson.title}`)
							}
						>
							<PlayCircle className="mr-2 h-4 w-4" />
							Start Next Lesson
						</Button>
					</div>
				</Card>
			</section>

			{/* Lessons List - Displays all lessons with their statuses and actions */}
			<section className="mb-10">
				<h2 className="text-2xl font-semibold text-gray-900 mb-6">Lessons</h2>
				<div className="space-y-4">
					{sortedLessons.map((lesson) => (
						<Card
							key={lesson.id}
							className="p-6 hover:shadow-md transition-shadow"
						>
							<div className="flex flex-col md:flex-row justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<h3 className="font-semibold text-gray-900">
											{lesson.title}
										</h3>
										{lesson.status === 'completed' && (
											<Badge variant="default" className="text-sm">
												<CheckCircle className="mr-1 h-3 w-3" />
												Completed
											</Badge>
										)}
										{lesson.status === 'locked' && (
											<Badge variant="secondary" className="text-sm">
												<Lock className="mr-1 h-3 w-3" />
												Locked
											</Badge>
										)}
									</div>
									<p className="text-gray-600 mb-2">{lesson.description}</p>
									<p className="text-sm text-gray-500">
										Estimated time: {lesson.estimatedTime}
									</p>
								</div>

								<div className="flex-shrink-0">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant={
													lesson.status === 'completed' ? 'outline' : 'default'
												}
												disabled={lesson.status === 'locked'}
												className="w-full md:w-auto"
												aria-label={`${lesson.status === 'completed' ? 'Review' : lesson.status === 'ready' ? 'Start' : 'Locked'} lesson: ${lesson.title}`}
												onClick={() => {
													// * Andler:
													// ? Here we can handle the action for the lesson
													// ? For example, navigate to the lesson page or show a modal
													// ? For this example, we will just log the lesson ID
													console.log(`Lesson action ID: ${lesson.id}`)

													// ? In a real application, you would replace this with your navigation logic
													// ? For example, using Next.js router:

													// ? router.push(`/lessons/${lesson.id}`)

													// ? Or if you are using a modal:

													// ? setShowLessonModal(true)
													// ? setSelectedLesson(lesson)
												}}
											>
												{lesson.status === 'completed'
													? 'Review'
													: lesson.status === 'ready'
														? 'Start'
														: 'Locked'}
											</Button>
										</TooltipTrigger>
										{lesson.status === 'locked' && (
											<TooltipContent
												role="tooltip"
												id={`tooltip-${lesson.id}`}
											>
												<p>Complete previous lessons to unlock</p>
											</TooltipContent>
										)}
									</Tooltip>
								</div>
							</div>
						</Card>
					))}
				</div>
			</section>

			{/* CTA Section - Provides encouragement based on progress and options for further actions */}
			<section className="text-center py-8 border-t border-gray-200">
				<h3 className="text-xl font-semibold text-gray-900 mb-4">
					{progress < 100
						? "Keep going! You're doing great!"
						: "Congratulations! You've completed this module!"}
				</h3>
				<div className="flex flex-col sm:flex-row justify-center gap-4">
					<Button
						variant="default"
						className="w-full sm:w-auto"
						onClick={() => console.log('Continue learning')}
					>
						{progress < 100 ? 'Continue Learning' : 'Explore More Modules'}
					</Button>
					<Button
						variant="outline"
						className="w-full sm:w-auto"
						onClick={() => console.log('View badges')}
					>
						View Badges
					</Button>
				</div>
			</section>
		</div>
	)
}

export default ModuleDetailPage
