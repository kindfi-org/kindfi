export interface LessonMetadata {
	title: string
	subtitle: string
	readTime: number
	level: 'Beginner' | 'Intermediate' | 'Advanced'
	xpEarned: number
	lessonNumber: number
	totalLessons: number
	progress: number
	moduleId: number
	lessonId: number
	previousLesson?: {
		title: string
		moduleId: number
		lessonId: number
	}
	nextLesson?: {
		title: string
		moduleId: number
		lessonId: number
	}
}

export interface LessonContent {
	title: string
	content: LessonSection[]
}

export interface LessonSection {
	type: 'paragraph' | 'heading' | 'subheading' | 'bulletList'
	content: string
	items?: string[]
}

export interface QuizQuestion {
	id: number
	question: string
	options: string[]
	correctAnswer: number
	explanation: string
}

export interface Lesson {
	metadata: LessonMetadata
	content: LessonContent
	quiz: QuizQuestion[]
}
