// Common types used in the QA component

import type { Tables } from '@services/supabase'

export type ProfileRow = Tables<'profiles'>
export type UserData =
	| ProfileRow
	| { id: string; full_name: string; is_team_member: boolean }
	| null

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

export interface QAClientProps extends QAProps {
	initialQuestions: CommentData[]
	initialComments: CommentData[]
}
