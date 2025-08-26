import type { TypedSupabaseClient } from '@packages/lib/types'
import type { Tables, TablesUpdate } from '@services/supabase'
import type { CommentData, UserData } from '../types/project'

export async function fetchQuestions(
	client: TypedSupabaseClient,
	projectId: string,
): Promise<CommentData[]> {
	const { data, error } = await client
		.from('comments')
		.select(
			`*, author:profiles (id, full_name, image_url, email), project_members (role, project_id, profile_id)`,
		) // eslint-disable-line max-len
		.eq('project_id', projectId)
		.eq('type', 'question')
		.is('parent_comment_id', null)
		.order('created_at', { ascending: false })

	if (error) throw error

	if (!data || !data.length) return []

	return data.map((item) => ({
		...item,
		created_at: item.created_at || new Date().toISOString(),
		author: item.author_id?.includes('-')
			? { id: item.author_id, full_name: 'Guest User', is_team_member: false }
			: undefined,
	})) as CommentData[]
}

export async function fetchChildComments(
	client: TypedSupabaseClient,
	projectId: string,
): Promise<CommentData[]> {
	const { data, error } = await client
		.from('comments')
		.select('*')
		.eq('project_id', projectId)
		.not('parent_comment_id', 'is', null)
		.order('created_at', { ascending: true })

	if (error) throw error
	if (!data || data.length === 0) return []

	const authorIds = [...new Set(data.map((i) => i.author_id))]
	const { data: authors, error: authorsError } = await client
		.from('profiles')
		.select('*')
		.in('id', authorIds)

	if (authorsError || !authors) {
		return data.map((item) => ({
			...item,
			created_at: item.created_at || new Date().toISOString(),
			author: null,
		})) as unknown as CommentData[]
	}

	const authorsMap = authors.reduce(
		(acc: Record<string, UserData>, author) => {
			if (author) {
				acc[author.id] = author
			}
			return acc
		},
		{} as Record<string, UserData>,
	)

	return data.map((comment) => ({
		...comment,
		created_at: comment.created_at || new Date().toISOString(),
		author:
			authorsMap[comment.author_id] ||
			(comment.author_id?.includes('-')
				? {
						id: comment.author_id,
						full_name: 'Guest User',
						is_team_member: false,
					}
				: null),
	})) as CommentData[]
}
