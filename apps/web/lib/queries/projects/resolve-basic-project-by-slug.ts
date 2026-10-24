import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { logger } from '@/lib/logger'
import { getProjectIdBySlug } from '~/lib/api/authorize-project-manage'
import { canAccessDevelopmentOnlyProject } from '~/lib/queries/projects/development-only-access'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import type { LocalizeOptions } from '~/lib/services/content-translation'

export type ResolveBasicProjectBySlugOptions = LocalizeOptions & {
	viewerLocale?: SupportedLocale
}

export async function resolveBasicProjectBySlug(
	slug: string,
	userId?: string | null,
	options?: ResolveBasicProjectBySlugOptions,
) {
	const publicClient = await createSupabaseServerClient()

	try {
		const publicProject = await getBasicProjectInfoBySlug(publicClient, slug, options)
		if (publicProject) {
			return publicProject
		}
	} catch (error) {
		logger.error('[resolveBasicProjectBySlug] Public project fetch failed:', error)
	}

	if (!userId) {
		return null
	}

	const projectId = await getProjectIdBySlug(slug)
	if (!projectId) {
		return null
	}

	const { data: projectMeta } = await supabaseServiceRole
		.from('projects')
		.select('development_only, status, kindler_id')
		.eq('id', projectId)
		.single()

	if (!projectMeta) {
		return null
	}

	if (projectMeta.development_only) {
		const allowed = await canAccessDevelopmentOnlyProject(projectId, userId)
		if (allowed) {
			return getBasicProjectInfoBySlug(supabaseServiceRole, slug, {
				...options,
				localize: false,
			})
		}
		return null
	}

	if (projectMeta.status === 'draft' || projectMeta.status === 'review') {
		if (projectMeta.kindler_id === userId) {
			return getBasicProjectInfoBySlug(supabaseServiceRole, slug, {
				...options,
				localize: false,
			})
		}
		const { data: profile } = await supabaseServiceRole
			.from('profiles')
			.select('role')
			.eq('id', userId)
			.single()
		if (profile?.role === 'admin') {
			return getBasicProjectInfoBySlug(supabaseServiceRole, slug, {
				...options,
				localize: false,
			})
		}
	}

	return null
}
