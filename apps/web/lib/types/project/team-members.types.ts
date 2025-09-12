import type { Enums } from '@services/supabase'

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

export interface InviteMemberData {
	email: string
	role: Enums<'project_member_role'>
	title?: string
}

export interface PendingInvitation {
	id: string
	miid: string
	projectId: string
	email: string
	role: Enums<'project_member_role'>
	title?: string
	invitedBy: string
	invitedAt: Date
	expiresAt: Date
	status: InvitationStatus
}
