import type { Enums } from '@services/supabase'

export interface InviteMemberData {
	email: string
	role: Enums<'project_member_role'>
	title?: string
}
