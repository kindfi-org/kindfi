export interface ProjectTeamMember {
	id: string
	projectId: string
	fullName: string
	roleTitle: string
	bio?: string | null
	photoUrl?: string | null
	yearsInvolved?: number | null
	orderIndex: number
	createdAt: string
	updatedAt: string
}

export interface CreateTeamMemberData {
	fullName: string
	roleTitle: string
	bio?: string
	photoUrl?: string
	yearsInvolved?: number
}

export interface UpdateTeamMemberData {
	fullName?: string
	roleTitle?: string
	bio?: string
	photoUrl?: string
	yearsInvolved?: number
	orderIndex?: number
}
