'use client'

import {
	useCreateTeamMemberMutation,
	useDeleteTeamMemberMutation,
	useUpdateTeamMemberMutation,
} from './team-mutation/team-member-mutations'

export function useTeamMutation() {
	const createMember = useCreateTeamMemberMutation()
	const updateMember = useUpdateTeamMemberMutation()
	const deleteMember = useDeleteTeamMemberMutation()

	return {
		createMember,
		updateMember,
		deleteMember,
	}
}
