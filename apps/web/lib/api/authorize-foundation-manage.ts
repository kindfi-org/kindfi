import { supabase as supabaseServiceRole } from '@packages/lib/supabase'

const MANAGE_MEMBER_ROLES = ['core', 'admin', 'editor'] as const

export type FoundationManageAccess = {
	userId: string
	foundationId: string
	isFounder: boolean
	isPlatformAdmin: boolean
}

export async function getFoundationIdBySlug(slug: string): Promise<string | null> {
	const { data, error } = await supabaseServiceRole
		.from('foundations')
		.select('id')
		.eq('slug', slug)
		.maybeSingle()

	if (error || !data) return null
	return data.id
}

export async function authorizeFoundationManage(
	userId: string,
	foundationId: string,
): Promise<{ ok: true; access: FoundationManageAccess } | { ok: false; status: 403 | 404 }> {
	const [foundationResult, memberResult, profileResult] = await Promise.all([
		supabaseServiceRole
			.from('foundations')
			.select('id, founder_id')
			.eq('id', foundationId)
			.single(),
		supabaseServiceRole
			.from('foundation_members')
			.select('role')
			.eq('foundation_id', foundationId)
			.eq('user_id', userId)
			.in('role', [...MANAGE_MEMBER_ROLES])
			.maybeSingle(),
		supabaseServiceRole.from('profiles').select('role').eq('id', userId).maybeSingle(),
	])

	const { data: foundation, error: foundationError } = foundationResult
	if (foundationError || !foundation) {
		return { ok: false, status: 404 }
	}

	const isFounder = foundation.founder_id === userId
	const isPlatformAdmin = profileResult.data?.role === 'admin'
	const hasEditorRole = !!memberResult.data

	if (!isFounder && !hasEditorRole && !isPlatformAdmin) {
		return { ok: false, status: 403 }
	}

	return {
		ok: true,
		access: { userId, foundationId: foundation.id, isFounder, isPlatformAdmin },
	}
}
