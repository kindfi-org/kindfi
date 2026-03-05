import type { TypedSupabaseClient } from '@packages/lib/types'
import type { TeamMember } from '~/lib/types/project/project-detail.types'

export async function getProjectTeam(
	client: TypedSupabaseClient,
	projectId: string,
): Promise<TeamMember[]> {
	const { data: members, error } = await client
		.from('project_team')
		.select('id, full_name, role_title, bio, photo_url, order_index')
		.eq('project_id', projectId)
		.order('order_index', { ascending: true })
		.order('created_at', { ascending: true })

	if (error) {
		// Table may not exist in all environments — return empty instead of throwing
		if (
			error.message?.includes('does not exist') ||
			error.message?.includes('relation') ||
			error.code === '42P01'
		) {
			console.warn('project_team table not found')
			return []
		}
		throw error
	}

	return (members ?? []).map((m) => ({
		id: m.id,
		displayName: m.full_name,
		avatar: m.photo_url ?? null,
		bio: m.bio ?? null,
		role: 'core' as const,
		title: m.role_title ?? 'Member',
	}))
}
