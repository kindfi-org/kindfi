import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { canAccessDevelopmentOnlyProject } from '~/lib/queries/projects/development-only-access'

const MANAGE_MEMBER_ROLES = ['core', 'admin', 'editor'] as const

/**
 * Returns true when the user may access project manage routes:
 * platform admin, project owner (kindler), or team member with edit access.
 */
export async function canUserManageProject(
	projectId: string,
	kindlerId: string | null,
	userId: string | undefined,
): Promise<boolean> {
	if (!userId) {
		return false
	}

	if (kindlerId === userId) {
		const allowed = await canAccessDevelopmentOnlyProject(projectId, userId)
		return allowed
	}

	const { data: profile } = await supabaseServiceRole
		.from('profiles')
		.select('role')
		.eq('id', userId)
		.maybeSingle()

	if (profile?.role === 'admin') {
		return true
	}

	const allowed = await canAccessDevelopmentOnlyProject(projectId, userId)
	if (!allowed) {
		return false
	}

	const { data: member } = await supabaseServiceRole
		.from('project_members')
		.select('role')
		.eq('project_id', projectId)
		.eq('user_id', userId)
		.in('role', [...MANAGE_MEMBER_ROLES])
		.maybeSingle()

	return Boolean(member)
}
