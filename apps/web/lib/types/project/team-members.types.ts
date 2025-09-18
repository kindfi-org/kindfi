import type { Enums } from '@services/supabase'

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

export interface ProjectMember {
	id: string
	userId: string
	email: string | null
	displayName: string | null
	avatar: string | null
	role: Enums<'project_member_role'>
	title: string
	joinedAt: string
}

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
	invitedBy?: string
	invitedAt: Date
	expiresAt: Date
	status: InvitationStatus
}
