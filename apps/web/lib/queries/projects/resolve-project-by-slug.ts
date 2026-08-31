import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { logger } from '@/lib/logger'
import { getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import { canAccessDevelopmentOnlyProject } from '~/lib/queries/projects/development-only-access'
import { getProjectBySlug } from '~/lib/queries/projects/get-project-by-slug'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import type { LocalizeOptions } from '~/lib/services/content-translation'

export type ResolveProjectBySlugOptions = LocalizeOptions & {
	viewerLocale?: SupportedLocale
}

/**
 * Loads a project detail payload, including development-only rows for authorized viewers.
 * Draft and review projects are also accessible to their owner and platform admins.
 */
export async function resolveProjectBySlug(
	slug: string,
	userId?: string | null,
	options?: ResolveProjectBySlugOptions,
) {
	const publicClient = await createSupabaseServerClient()

	try {
		const publicProject = await getProjectBySlug(publicClient, slug, options)
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

	// Fetch project metadata needed for both access checks in one query
	const { data: projectMeta } = await supabaseServiceRole
		.from('projects')
		.select('development_only, status, kindler_id')
		.eq('id', projectId)
		.single()

	if (!projectMeta) {
		return null
	}

	// Allow development-only project access (existing behavior)
	if (projectMeta.development_only) {
		const allowed = await canAccessDevelopmentOnlyProject(projectId, userId)
		if (allowed) {
			return getProjectBySlug(supabaseServiceRole, slug, { ...options, localize: false })
		}
	}

	// Allow project owner and platform admins to preview draft/review campaigns
	if (projectMeta.status === 'draft' || projectMeta.status === 'review') {
		if (projectMeta.kindler_id === userId) {
			return getProjectBySlug(supabaseServiceRole, slug, { ...options, localize: false })
		}
		const { data: profile } = await supabaseServiceRole
			.from('profiles')
			.select('role')
			.eq('id', userId)
			.single()
		if (profile?.role === 'admin') {
			return getProjectBySlug(supabaseServiceRole, slug, { ...options, localize: false })
		}
	}

	return null
}
