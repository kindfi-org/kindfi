import type { Enums, Tables } from '@services/supabase'

export type ProfileRow = Tables<'profiles'>
export type UserData =
	| ProfileRow
	| { id: string; full_name: string; is_team_member: boolean }
	| null

// Q&A specific metadata types
export interface QuestionMetadata {
	status: 'new' | 'answered' | 'resolved'
}

export interface AnswerMetadata {
	is_official?: boolean
}

export interface CommentMetadata {
	[key: string]: unknown
}

// Type-safe metadata based on comment type
export type TypedMetadata<T extends Enums<'comment_type'>> =
	T extends 'question'
		? QuestionMetadata
		: T extends 'answer'
			? AnswerMetadata
			: CommentMetadata

export interface CommentData extends Omit<Tables<'comments'>, 'metadata'> {
	metadata?: QuestionMetadata | AnswerMetadata | CommentMetadata
	author?: UserData
}

// Type-safe comment data based on comment type
export interface TypedCommentData<T extends Enums<'comment_type'>>
	extends Omit<Tables<'comments'>, 'metadata' | 'type'> {
	type: T
	metadata: TypedMetadata<T>
	author?: UserData
}

export type QuestionData = TypedCommentData<'question'>
export type AnswerData = TypedCommentData<'answer'>
export type RegularCommentData = TypedCommentData<'comment'>

// Enhanced interfaces with type-safe relationships
export interface CommentWithReplies extends CommentData {
	replies?: CommentData[]
}

export interface QuestionWithAnswers extends QuestionData {
	answers?: AnswerData[]
}

export interface AnswerWithReplies extends AnswerData {
	replies?: RegularCommentData[]
}

export interface QAProps {
	projectId: string
	currentUser?: UserData | null
}

export interface QAClientProps extends QAProps {
	initialQuestions: QuestionData[]
	initialComments: CommentData[]
}

// Helper types for role-based permissions
export interface ProjectMemberRole {
	role: Enums<'project_member_role'>
	user_id: string
	project_id: string
}

export interface UserRole {
	role: Enums<'user_role'>
	is_project_owner: boolean
	is_team_member: boolean
	project_member_role?: Enums<'project_member_role'>
}
