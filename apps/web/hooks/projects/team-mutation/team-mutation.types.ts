import type {
	CreateTeamMemberData,
	UpdateTeamMemberData,
} from '~/lib/types/project/project-team.types'

export type CreateTeamMemberRequest = CreateTeamMemberData & {
	projectId: string
	projectSlug: string
}

export type UpdateTeamMemberRequest = UpdateTeamMemberData & {
	projectId: string
	projectSlug: string
	memberId: string
}

export type DeleteTeamMemberRequest = {
	projectId: string
	projectSlug: string
	memberId: string
}

export type TeamMemberResponse = {
	message: string
	member?: {
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
}
