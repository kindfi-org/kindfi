import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getProjectQuestions(
	client: TypedSupabaseClient,
	projectId: string,
) {
	// Fetch all comments for the given project (Q&A type)
	const { data: comments, error: commentsError } = await client
		.from('comments')
		.select('id, content, created_at, type, parent_comment_id, author_id')
		.eq('project_id', projectId)
		.in('type', ['question', 'answer'])

	if (commentsError) throw commentsError

	// Get unique author IDs
	const authorIds = [...new Set(comments.map((c) => c.author_id))]

	// Fetch author profiles
	const { data: authors, error: authorsError } = await client
		.from('profiles')
		.select('id, display_name, image_url')
		.in('id', authorIds)

	if (authorsError) throw authorsError

	// Comments with author profile
	const enrichedComments = comments.map((c) => {
		const author = authors.find((a) => a.id === c.author_id)
		return {
			id: c.id,
			content: c.content,
			date: c.created_at ?? '',
			type: c.type,
			parentId: c.parent_comment_id ?? undefined,
			author: {
				id: c.author_id,
				name: author?.display_name ?? 'Unknown',
				avatar: author?.image_url ?? '/images/placeholder.png',
			},
			like: 0,
		}
	})

	return enrichedComments
}
