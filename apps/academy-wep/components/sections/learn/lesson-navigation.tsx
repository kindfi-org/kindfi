import { ArrowLeft, ArrowRight, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Progress } from '~/components/base/progress'
import type { LessonMetadata } from '~/lib/types/learn/lesson.types'

interface LessonNavigationProps {
	metadata: LessonMetadata
}

export function LessonNavigation({ metadata }: LessonNavigationProps) {
	return (
		<div className="space-y-10 mt-8">
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

				{metadata.nextLesson && (
					<Button variant="gradient-green" asChild>
						<Link
							href={`/learn/${metadata.nextLesson.moduleId}/${metadata.nextLesson.lessonId}`}
						>
							Next: {metadata.nextLesson.title}
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				)}
			</div>

			<Card className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl shadow-md space-y-6 md:space-y-0 gap-6">
				<div className="flex-1 space-y-3">
					<CardHeader className="p-0">
						<CardTitle className="text-2xl font-bold text-foreground">
							Your Progress
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 space-y-2">
						<p className="text-muted-foreground text-base">
							You're making great progress! Continue to the next lesson to learn
							about Asset Issuance on the Stellar network.
						</p>

						<div className="flex items-center gap-4">
							<Progress
								value={metadata.progress}
								className="h-2 flex-grow rounded-full"
							/>
							<span className="text-sm font-semibold text-foreground whitespace-nowrap">
								{metadata.progress}% Complete
							</span>
						</div>

						<Button variant="gradient-green" size="lg" asChild className="mt-4">
							<Link
								href={`/learn/${metadata.nextLesson?.moduleId || metadata.moduleId}/${metadata.nextLesson?.lessonId || metadata.lessonId}`}
							>
								Continue Learning
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</div>

				<div className="flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tl from-blue-100 to-green-100 p-3">
					<div className="flex items-center justify-center w-full h-full bg-white rounded-full">
						<Award className="h-12 w-12 text-green-600" />
					</div>
				</div>
			</Card>
		</div>
	)
}
