import type { TypedSupabaseClient } from '@packages/lib/types'
import { logger } from '@/lib/logger'
import type { ProjectTeamMember } from '~/lib/types/project/project-team.types'

export async function getFoundationTeamBySlug(
	client: TypedSupabaseClient,
	foundationSlug: string,
): Promise<{ foundationId: string; team: ProjectTeamMember[] } | null> {
	const { data: foundation, error: foundationError } = await client
		.from('foundations')
		.select('id')
		.eq('slug', foundationSlug)
		.single()

	if (foundationError) throw foundationError
	if (!foundation) return null

	const { data: team, error: teamError } = await client
		.from('foundation_team')
		.select('*')
		.eq('foundation_id', foundation.id)
		.order('order_index', { ascending: true })
		.order('created_at', { ascending: true })

	if (teamError) {
		if (
			teamError.message?.includes('does not exist') ||
			teamError.message?.includes('relation') ||
			teamError.code === '42P01'
		) {
			logger.warn('foundation_team table does not exist yet. Please run the migration.')
			return {
				foundationId: foundation.id,
				team: [],
			}
		}
		throw teamError
	}

	return {
		foundationId: foundation.id,
		team:
			team?.map((member) => ({
				id: member.id,
				projectId: member.foundation_id,
				userId: member.user_id ?? null,
				fullName: member.full_name,
				roleTitle: member.role_title,
				bio: member.bio || null,
				photoUrl: member.photo_url || null,
				yearsInvolved: member.years_involved || null,
				orderIndex: member.order_index,
				isManager: Boolean(member.user_id),
				createdAt: member.created_at,
				updatedAt: member.updated_at,
			})) || [],
	}
}
