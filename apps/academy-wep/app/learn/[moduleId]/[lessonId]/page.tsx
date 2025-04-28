import { ChevronRight } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
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

interface LessonPageParams {
	params: {
		moduleId: string
		lessonId: string
	}
}

export default async function LessonPage({ params }: LessonPageParams) {
	const { moduleId, lessonId } = await params

	const lesson = moduleLessons.find(
		(l) =>
			l.metadata.moduleId === Number(moduleId) &&
			l.metadata.lessonId === Number(lessonId),
	)

	if (!lesson) {
		notFound()
	}

	// If lesson is locked and previous lesson is not completed
	if (
		lesson.metadata.lessonNumber > 1 &&
		moduleLessons[lesson.metadata.lessonNumber - 2].metadata.progress < 100
	) {
		redirect(`/learn/${moduleId}`)
	}

	const totalLessons = moduleLessons.filter(
		(l) => l.metadata.moduleId === Number(moduleId),
	).length

	const completedLessons = moduleLessons.filter(
		(l) =>
			l.metadata.moduleId === Number(moduleId) && l.metadata.progress === 100,
	).length

	const moduleProgress = (completedLessons / totalLessons) * 100

	const headerProgress =
		(lesson.metadata.lessonNumber / lesson.metadata.totalLessons) * 100

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
								href={`/learn/${moduleId}`}
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
								Consensus Mechanism
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
					<KnowledgeCheck questions={lesson.quiz} />
				</TabsContent>
			</Tabs>

			<LessonNavigation
				metadata={lesson.metadata}
				moduleProgress={moduleProgress}
			/>
		</div>
	)
}
