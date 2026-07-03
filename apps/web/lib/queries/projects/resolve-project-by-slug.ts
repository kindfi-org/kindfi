import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { logger } from '@/lib/logger'
import { getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import {
	canAccessDevelopmentOnlyProject,
	getProjectDevelopmentOnlyFlag,
} from '~/lib/queries/projects/development-only-access'
import { getProjectBySlug } from '~/lib/queries/projects/get-project-by-slug'

/**
 * Loads a project detail payload, including development-only rows for authorized viewers.
 */
export async function resolveProjectBySlug(slug: string, userId?: string | null) {
	const publicClient = await createSupabaseServerClient()

	try {
		const publicProject = await getProjectBySlug(publicClient, slug)
		if (publicProject) {
			return publicProject
		}
	} catch (error) {
		logger.error('[resolveProjectBySlug] Public project fetch failed:', error)
	}

	if (!userId) {
		return null
	}

	const projectId = await getProjectIdBySlug(slug)
	if (!projectId) {
		return null
	}

	const developmentOnly = await getProjectDevelopmentOnlyFlag(projectId)
	if (!developmentOnly) {
		return null
	}

	const allowed = await canAccessDevelopmentOnlyProject(projectId, userId)
	if (!allowed) {
		return null
	}

	return getProjectBySlug(supabaseServiceRole, slug)
}
