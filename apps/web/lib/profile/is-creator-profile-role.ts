import type { Database } from '@services/supabase'

type UserRole = Database['public']['Enums']['user_role']

/** Profile campaign/foundation views apply to creators and platform admins. */
export function isCreatorProfileRole(role: UserRole | null | undefined): boolean {
	return role === 'creator' || role === 'admin'
}
