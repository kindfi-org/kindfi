// Common types used in the QA component

export interface UserData {
	id: string
	full_name?: string
	avatar_url?: string
	is_team_member?: boolean
}

export interface CommentData {
	id: string
	content: string
	created_at: string
	project_id: string
	author_id: string
	type?: string
	parent_comment_id?: string | null
	is_resolved?: boolean
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
