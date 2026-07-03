import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { canAccessDevelopmentOnlyProject } from '~/lib/queries/projects/development-only-access'

export type ProjectManageAccess = {
	userId: string
	projectId: string
	isOwner: boolean
	isPlatformAdmin: boolean
}

export async function getProjectIdBySlug(slug: string): Promise<string | null> {
	const { data, error } = await supabaseServiceRole
		.from('projects')
		.select('id')
		.eq('slug', slug)
		.maybeSingle()

	if (error || !data) return null
	return data.id
}

export async function authorizeProjectManage(
	userId: string,
	projectId: string,
): Promise<{ ok: true; access: ProjectManageAccess } | { ok: false; status: 403 | 404 }> {
	const [projectResult, memberResult, profileResult] = await Promise.all([
		supabaseServiceRole.from('projects').select('id, kindler_id').eq('id', projectId).single(),
		supabaseServiceRole
			.from('project_members')
			.select('role')
			.eq('project_id', projectId)
			.eq('user_id', userId)
			.in('role', [...MANAGE_MEMBER_ROLES])
			.maybeSingle(),
		supabaseServiceRole.from('profiles').select('role').eq('id', userId).maybeSingle(),
	])

	const { data: project, error: projectError } = projectResult
	if (projectError || !project) {
		return { ok: false, status: 404 }
	}

	const isOwner = project.kindler_id === userId
	const isPlatformAdmin = profileResult.data?.role === 'admin'
	const hasEditorRole = !!memberResult.data

	const devAccessAllowed = await canAccessDevelopmentOnlyProject(projectId, userId)
	if (!devAccessAllowed) {
		return { ok: false, status: 403 }
	}

	if (!isOwner && !hasEditorRole && !isPlatformAdmin) {
		return { ok: false, status: 403 }
	}

	return {
		ok: true,
		access: { userId, projectId: project.id, isOwner, isPlatformAdmin },
	}
}
