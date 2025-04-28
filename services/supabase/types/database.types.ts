export type CommentType = 'comment' | 'question' | 'answer'

export interface CommentMetadata {
	status?: 'new' | 'answered' | 'resolved'
	is_official?: boolean
}

export interface Comment {
	id: string
	content: string
	type: CommentType
	metadata: CommentMetadata
	parent_comment_id?: string
	project_id: string
	author_id: string
	created_at: string
	updated_at: string
}
