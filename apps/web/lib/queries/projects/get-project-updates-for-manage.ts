import type { TypedSupabaseClient } from '@packages/lib/types'
import { getProjectUpdates } from './get-project-updates'

export type ProjectUpdateForManage = {
	id: string
	title: string
	content: string
	date: string
	author: {
		id: string
		name: string
		avatar: string
	}
}

export async function getProjectUpdatesForManage(
	client: TypedSupabaseClient,
	projectSlug: string,
): Promise<{ projectId: string; updates: ProjectUpdateForManage[] } | null> {
	const { data: project, error } = await client
		.from('projects')
		.select('id')
		.eq('slug', projectSlug)
		.single()

	if (error || !project) return null

	const updates = await getProjectUpdates(client, project.id)

	return {
		projectId: project.id,
		updates: updates.map((update) => ({
			id: update.id,
			title: update.title,
			content: update.content,
			date: update.date,
			author: update.author,
		})),
	}
}
