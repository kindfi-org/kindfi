import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getProjectUpdates(
	client: TypedSupabaseClient,
	projectId: string,
) {
	// Fetch all updates for the given project
	const { data: updates, error: updatesError } = await client
		.from('project_updates')
		.select('id, title, content, created_at, author_id')
		.eq('project_id', projectId)
		.order('created_at', { ascending: false })

	if (updatesError) throw updatesError

	// Fetch all comments linked to these updates
	const updateIds = updates.map((u) => u.id)
	const { data: comments, error: commentsError } = await client
		.from('comments')
		.select('id, content, created_at, author_id, type, project_update_id')
		.in('project_update_id', updateIds)

	if (commentsError) throw commentsError

	// Fetch profiles for all authors (both updates and comments)
	const authorIds = Array.from(
		new Set([
			...updates.map((u) => u.author_id),
			...comments.map((c) => c.author_id),
		]),
	)

	const { data: profiles, error: profilesError } = await client
		.from('profiles')
		.select('id, display_name, image_url')
		.in('id', authorIds)

	if (profilesError) throw profilesError

	// Map updates with their respective comments and authors
	const updatesWithComments = updates.map((u) => {
		const author = profiles.find((p) => p.id === u.author_id)
		return {
			id: u.id,
			title: u.title,
			content: u.content,
			date: u.created_at,
			author: {
				id: u.author_id,
				name: author?.display_name ?? 'Unknown',
				avatar: author?.image_url ?? '/images/placeholder.png',
			},
			comments: comments
				.filter((c) => c.project_update_id === u.id)
				.map((c) => {
					const commentAuthor = profiles.find((p) => p.id === c.author_id)
					return {
						id: c.id,
						content: c.content,
						date: c.created_at ?? '',
						type: c.type ?? 'comment',
						author: {
							id: c.author_id,
							name: commentAuthor?.display_name ?? 'Unknown',
							avatar: commentAuthor?.image_url ?? '/images/placeholder.png',
						},
						like: 0,
					}
				}),
		}
	})

	return updatesWithComments
}
