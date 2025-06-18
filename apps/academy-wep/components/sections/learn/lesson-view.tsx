'use client'

import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '~/components/base/breadcrumb'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { KnowledgeCheck } from '~/components/sections/learn/knowledge-check'
import { LessonContent } from '~/components/sections/learn/lesson-content'
import { LessonHeader } from '~/components/sections/learn/lesson-header'
import { LessonNavigation } from '~/components/sections/learn/lesson-navigation'
import { moduleLessons } from '~/lib/mock-data/learn/mock-lessons'
import type { Lesson } from '~/lib/types/learn/lesson.types'

interface LessonViewProps {
	lesson: Lesson
}

export function LessonView({ lesson }: LessonViewProps) {
	const [currentLesson, setCurrentLesson] = useState(lesson)

	const handleQuizComplete = () => {
		const lessonIndex = moduleLessons.findIndex(
			(l) =>
				l.metadata.moduleId === lesson.metadata.moduleId &&
				l.metadata.lessonId === lesson.metadata.lessonId,
		)

		if (lessonIndex !== -1) {
			moduleLessons[lessonIndex].metadata.progress = 100

			setCurrentLesson({
				...moduleLessons[lessonIndex],
			})
		}
	}

	const headerProgress =
		(currentLesson.metadata.lessonNumber /
			currentLesson.metadata.totalLessons) *
		100

	const totalLessons = moduleLessons.filter(
		(l) => l.metadata.moduleId === currentLesson.metadata.moduleId,
	).length

	const completedLessons = moduleLessons.filter(
		(l) =>
			l.metadata.moduleId === currentLesson.metadata.moduleId &&
			l.metadata.progress === 100,
	).length

	const moduleProgress = (completedLessons / totalLessons) * 100

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-6">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/learn" className="hover:text-primary">
								Learn
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator>
							<ChevronRight className="h-4 w-4" />
						</BreadcrumbSeparator>
						<BreadcrumbItem>
							<BreadcrumbLink
								href={`/learn/${lesson.metadata.moduleId}`}
								className="hover:text-primary"
							>
								Stellar Blockchain Basics
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator>
							<ChevronRight className="h-4 w-4" />
						</BreadcrumbSeparator>
						<BreadcrumbItem>
							<BreadcrumbLink className="font-semibold text-foreground">
								{lesson.metadata.title}
							</BreadcrumbLink>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<LessonHeader
				metadata={lesson.metadata}
				headerProgress={headerProgress}
			/>

			<Tabs defaultValue="content" className="w-full mt-8">
				<TabsList>
					<TabsTrigger
						value="content"
						className="data-[state=active]:text-primary"
					>
						Lesson Content
					</TabsTrigger>
					<TabsTrigger
						value="quiz"
						className="data-[state=active]:text-primary"
					>
						Knowledge Check
					</TabsTrigger>
				</TabsList>

				<TabsContent value="content">
					<LessonContent content={lesson.content} />
				</TabsContent>

				<TabsContent value="quiz">
					<KnowledgeCheck
						questions={lesson.quiz}
						onQuizComplete={handleQuizComplete}
					/>
				</TabsContent>
			</Tabs>

			<LessonNavigation
				metadata={lesson.metadata}
				moduleProgress={moduleProgress}
			/>
		</div>
	)
}
