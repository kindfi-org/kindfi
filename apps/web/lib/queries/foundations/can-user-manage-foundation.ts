import { supabase as supabaseServiceRole } from '@packages/lib/supabase'

const MANAGE_MEMBER_ROLES = ['core', 'admin', 'editor'] as const

/**
 * Returns true when the user may access foundation manage routes:
 * foundation founder or team member with edit access.
 */
export async function canUserManageFoundation(
	foundationId: string,
	founderId: string | null,
	userId: string | undefined,
): Promise<boolean> {
	if (!userId) {
		return false
	}

	if (founderId === userId) {
		return true
	}

	const { data: profile } = await supabaseServiceRole
		.from('profiles')
		.select('role')
		.eq('id', userId)
		.maybeSingle()

	if (profile?.role === 'admin') {
		return true
	}

	const { data: member } = await supabaseServiceRole
		.from('foundation_members')
		.select('role')
		.eq('foundation_id', foundationId)
		.eq('user_id', userId)
		.in('role', [...MANAGE_MEMBER_ROLES])
		.maybeSingle()

	return Boolean(member)
}
