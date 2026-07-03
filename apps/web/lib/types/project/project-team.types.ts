export interface ProjectTeamMember {
	id: string
	projectId: string
	userId?: string | null
	fullName: string
	roleTitle: string
	bio?: string | null
	photoUrl?: string | null
	yearsInvolved?: number | null
	orderIndex: number
	isManager?: boolean
	createdAt: string
	updatedAt: string
}

export interface CreateManualTeamMemberData {
	type: 'manual'
	fullName: string
	roleTitle: string
	bio?: string
	photoUrl?: string
	yearsInvolved?: number
}

export interface CreateRegisteredTeamMemberData {
	type: 'registered'
	userId: string
	roleTitle: string
	bio?: string
}

export type CreateTeamMemberData = CreateManualTeamMemberData | CreateRegisteredTeamMemberData

export interface UpdateTeamMemberData {
	fullName?: string
	roleTitle?: string
	bio?: string
	photoUrl?: string
	yearsInvolved?: number
	orderIndex?: number
}
