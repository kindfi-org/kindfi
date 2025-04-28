export type CommentType = 'comment' | 'question' | 'answer'

export type CommentStatus = 'new' | 'answered' | 'resolved'

export interface CommentMetadata {
	status?: CommentStatus
	isOfficial?: boolean
}

export interface Comment {
	id: string
	content: string
	type: CommentType
	metadata: CommentMetadata
	parentCommentId?: string
	projectId: string
	authorId: string
	createdAt: Date
	updatedAt: Date
}
