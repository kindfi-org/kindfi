import type { TypedSupabaseClient } from '@packages/lib/types'
import type { ProjectTeamMember } from '~/lib/types/project/project-team.types'

export async function getProjectTeamBySlug(
	client: TypedSupabaseClient,
	projectSlug: string,
): Promise<{ projectId: string; team: ProjectTeamMember[] } | null> {
	const { data: project, error: projectError } = await client
		.from('projects')
		.select('id')
		.eq('slug', projectSlug)
		.single()

	if (projectError) throw projectError
	if (!project) return null

	const { data: team, error: teamError } = await client
		.from('project_team')
		.select('*')
		.eq('project_id', project.id)
		.order('order_index', { ascending: true })
		.order('created_at', { ascending: true })

	// If table doesn't exist yet (migration not run), return empty team
	// This prevents 404 errors before the migration is applied
	if (teamError) {
		// Check if it's a "relation does not exist" error
		if (
			teamError.message?.includes('does not exist') ||
			teamError.message?.includes('relation') ||
			teamError.code === '42P01'
		) {
			console.warn(
				'project_team table does not exist yet. Please run the migration.',
			)
			return {
				projectId: project.id,
				team: [],
			}
		}
		throw teamError
	}

	return {
		projectId: project.id,
		team:
			team?.map((member) => ({
				id: member.id,
				projectId: member.project_id,
				fullName: member.full_name,
				roleTitle: member.role_title,
				bio: member.bio || null,
				photoUrl: member.photo_url || null,
				yearsInvolved: member.years_involved || null,
				orderIndex: member.order_index,
				createdAt: member.created_at,
				updatedAt: member.updated_at,
			})) || [],
	}
}
