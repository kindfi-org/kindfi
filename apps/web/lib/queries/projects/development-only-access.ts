import { supabase as supabaseServiceRole } from '@packages/lib/supabase'

export type ProjectDevelopmentOnlyRow = {
	id: string
	development_only: boolean
}

/**
 * Returns true when the user has the platform admin role in profiles.
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
	const { data } = await supabaseServiceRole
		.from('profiles')
		.select('role')
		.eq('id', userId)
		.maybeSingle()

	return data?.role === 'admin'
}

/**
 * Loads development_only for a project. Returns null when the project does not exist.
 */
export async function getProjectDevelopmentOnlyFlag(projectId: string): Promise<boolean | null> {
	const { data, error } = await supabaseServiceRole
		.from('projects')
		.select('development_only')
		.eq('id', projectId)
		.maybeSingle()

	if (error || !data) {
		return null
	}

	return Boolean((data as { development_only?: boolean }).development_only)
}

/**
 * Development-only projects may only be viewed or managed by platform admins.
 */
export async function canAccessDevelopmentOnlyProject(
	projectId: string,
	userId: string | undefined,
): Promise<boolean> {
	if (!userId) {
		return false
	}

	const developmentOnly = await getProjectDevelopmentOnlyFlag(projectId)
	if (developmentOnly === null) {
		return false
	}

	if (!developmentOnly) {
		return true
	}

	return isPlatformAdmin(userId)
}
