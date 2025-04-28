import { notFound } from 'next/navigation'
import { LessonView } from '~/components/sections/learn/lesson-view'
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

	return <LessonView lesson={lesson} />
}
