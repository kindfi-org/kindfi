import { ArrowLeft, BookOpen, Clock, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Progress } from '~/components/base/progress'
import type { LessonMetadata } from '~/lib/types/learn/lesson.types'

interface LessonHeaderProps {
	metadata: LessonMetadata
	headerProgress: number
}

export function LessonHeader({ metadata, headerProgress }: LessonHeaderProps) {
	return (
		<div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-2xl p-8 shadow-md">
			<div className="space-y-3">
				<Button
					variant="outline"
					className="border-gray-200 hover:bg-green-100 hover:text-primary hover:border-primary"
					asChild
				>
					<Link href={`/learn/${metadata.moduleId}`}>
						<ArrowLeft className="h-4 w-4" />
						Back to Module
					</Link>
				</Button>

				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
					<div className="space-y-3">
						<h1 className="text-4xl font-extrabold text-foreground">
							{metadata.title}
						</h1>
						<p className="text-lg text-muted-foreground">{metadata.subtitle}</p>

						<div className="flex flex-wrap gap-3 mt-4">
							<Badge
								variant="outline"
								className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-normal text-muted-foreground border-none"
							>
								<Clock className="h-4 w-4 text-primary" />
								<span>{metadata.readTime} min read</span>
							</Badge>

							<Badge
								variant="outline"
								className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-normal text-muted-foreground border-none"
							>
								<BookOpen className="h-4 w-4 text-primary" />
								<span>{metadata.level}</span>
							</Badge>

							<Badge
								variant="outline"
								className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-normal text-muted-foreground border-none"
							>
								<Trophy className="h-4 w-4 text-primary" />
								<span>Earns XP: {metadata.xpEarned}</span>
							</Badge>
						</div>
					</div>

					<div className="flex flex-col items-end gap-1.5">
						<Badge
							variant="outline"
							className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-normal text-muted-foreground border-none"
						>
							Lesson {metadata.lessonNumber} of {metadata.totalLessons}
						</Badge>
						<Progress value={headerProgress} className="h-2 w-28" />
					</div>
				</div>
			</div>
		</div>
	)
}
