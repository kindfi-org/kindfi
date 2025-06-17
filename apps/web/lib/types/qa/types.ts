// Common types used in the QA component

import type { Tables } from '@services/supabase'

export interface UserData extends Tables<'profiles'> {}

export interface CommentData extends Omit<Tables<'comments'>, 'metadata'> {
	metadata?: Record<string, unknown>
	author?: UserData
}

export interface CommentWithReplies extends CommentData {
	replies?: CommentData[]
}

export interface CommentWithAnswers extends CommentData {
	answers?: CommentWithReplies[]
}

export interface QAProps {
	projectId: string
	currentUser?: UserData | null
}

export interface QAClientProps {
	projectId: string
	currentUser?: UserData | null
	initialQuestions: CommentData[]
	initialComments: CommentData[]
}
