import { ArrowLeft, ArrowRight, Award, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'
import { moduleLessons } from '~/lib/mock-data/learn/mock-lessons'
import type { LessonMetadata } from '~/lib/types/learn/lesson.types'

interface LessonNavigationProps {
	metadata: LessonMetadata
	moduleProgress: number
}

export function LessonNavigation({
	metadata,
	moduleProgress,
}: LessonNavigationProps) {
	const nextLesson = metadata.nextLesson
		? moduleLessons.find(
				(l) =>
					l.metadata.moduleId === metadata.nextLesson?.moduleId &&
					l.metadata.lessonId === metadata.nextLesson?.lessonId,
			)
		: undefined

	const isNextLessonLocked = nextLesson
		? nextLesson.metadata.lessonNumber > 1 &&
			moduleLessons[nextLesson.metadata.lessonNumber - 2].metadata.progress <
				100
		: false

	const isLastLesson = !metadata.nextLesson

	return (
		<div className="space-y-10 mt-8">
			{/* Navigation Buttons */}
			<div className="flex flex-col md:flex-row md:justify-between gap-4">
				{metadata.previousLesson ? (
					<Button
						variant="outline"
						className="border-gray-200 hover:bg-green-100 hover:text-primary hover:border-primary"
						asChild
					>
						<Link
							href={`/learn/${metadata.previousLesson.moduleId}/${metadata.previousLesson.lessonId}`}
						>
							<ArrowLeft className="h-4 w-4" />
							Previous: {metadata.previousLesson.title}
						</Link>
					</Button>
				) : (
					<div />
				)}

				{metadata.nextLesson &&
					(isNextLessonLocked ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="inline-flex">
										<Button
											variant="gradient-green"
											disabled
											className="flex items-center justify-center gap-2 w-full cursor-not-allowed"
										>
											<Lock className="h-4 w-4 text-white" />
											<span>Next: {metadata.nextLesson.title}</span>
										</Button>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									Complete the quiz to unlock {metadata.nextLesson.title}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<Button variant="gradient-green" asChild>
							<Link
								href={`/learn/${metadata.nextLesson.moduleId}/${metadata.nextLesson.lessonId}`}
							>
								Next: {metadata.nextLesson.title}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					))}
			</div>

			{/* Progress Card */}
			<Card className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl shadow-md space-y-6 md:space-y-0 gap-6">
				<div className="flex-1 space-y-3">
					<CardHeader className="p-0">
						<CardTitle className="text-2xl font-bold text-foreground">
							Your Progress
						</CardTitle>
					</CardHeader>

					<CardContent className="p-0 space-y-2">
						<p className="text-muted-foreground text-base">
							{metadata.nextLesson
								? `You're making great progress! Continue to the next lesson to learn about ${metadata.nextLesson.title} on the Stellar network.`
								: 'Congratulations! You have completed all lessons in this module.'}
						</p>

						<div className="flex items-center gap-4">
							<Progress
								value={moduleProgress}
								className="h-2 flex-grow rounded-full"
							/>
							<span className="text-sm font-semibold text-foreground whitespace-nowrap">
								{moduleProgress}% Complete
							</span>
						</div>

						{/* Continue Learning Button */}
						{!isLastLesson &&
							(isNextLessonLocked ? (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="inline-flex w-full md:w-auto">
												<Button
													variant="gradient-green"
													size="lg"
													disabled
													className="mt-4 flex items-center justify-center gap-2 cursor-not-allowed w-full md:w-auto"
												>
													<Lock className="h-5 w-5 text-white" />
													<span>Continue Learning</span>
												</Button>
											</div>
										</TooltipTrigger>
										<TooltipContent side="top">
											Complete the quiz to unlock {metadata.nextLesson?.title}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							) : (
								<Button
									variant="gradient-green"
									size="lg"
									asChild
									className="mt-4"
								>
									<Link
										href={`/learn/${metadata.nextLesson?.moduleId}/${metadata.nextLesson?.lessonId}`}
									>
										Continue Learning
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
							))}
					</CardContent>
				</div>

				{/* Award Icon */}
				<div className="flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tl from-blue-100 to-green-100 p-3">
					<div className="flex items-center justify-center w-full h-full bg-white rounded-full">
						<Award className="h-12 w-12 text-green-600" />
					</div>
				</div>
			</Card>
		</div>
	)
}
