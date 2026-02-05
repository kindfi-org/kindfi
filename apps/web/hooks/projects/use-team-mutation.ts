'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
	CreateTeamMemberData,
	UpdateTeamMemberData,
} from '~/lib/types/project/project-team.types'

type CreateTeamMemberRequest = CreateTeamMemberData & {
	projectId: string
	projectSlug: string
}

type UpdateTeamMemberRequest = UpdateTeamMemberData & {
	projectId: string
	projectSlug: string
	memberId: string
}

type DeleteTeamMemberRequest = {
	projectId: string
	projectSlug: string
	memberId: string
}

type TeamMemberResponse = {
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

export function useTeamMutation() {
	const queryClient = useQueryClient()

	const createMember = useMutation<
		TeamMemberResponse,
		Error,
		CreateTeamMemberRequest
	>({
		mutationFn: async (data) => {
			const res = await fetch(`/api/projects/${data.projectSlug}/team`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					projectId: data.projectId,
					fullName: data.fullName,
					roleTitle: data.roleTitle,
					bio: data.bio,
					photoUrl: data.photoUrl,
					yearsInvolved: data.yearsInvolved,
				}),
			})

			if (!res.ok) {
				const clonedRes = res.clone()
				let errorMessage = 'Failed to add team member'

				try {
					const contentType = clonedRes.headers.get('content-type')
					if (contentType?.includes('application/json')) {
						const error = await clonedRes.json()
						errorMessage = error?.error || errorMessage
					} else {
						const text = await clonedRes.text()
						errorMessage = text || errorMessage
					}
				} catch {
					// If reading fails, use default message
				}

				throw new Error(errorMessage)
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Team member added successfully! 🎉')
			queryClient.invalidateQueries({
				queryKey: ['supabase', 'project-team', variables.projectSlug],
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to add team member', {
				description: error.message,
			})
		},
	})

	const updateMember = useMutation<
		TeamMemberResponse,
		Error,
		UpdateTeamMemberRequest
	>({
		mutationFn: async (data) => {
			const res = await fetch(`/api/projects/${data.projectSlug}/team`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					projectId: data.projectId,
					memberId: data.memberId,
					fullName: data.fullName,
					roleTitle: data.roleTitle,
					bio: data.bio,
					photoUrl: data.photoUrl,
					yearsInvolved: data.yearsInvolved,
					orderIndex: data.orderIndex,
				}),
			})

			if (!res.ok) {
				const clonedRes = res.clone()
				let errorMessage = 'Failed to update team member'

				try {
					const contentType = clonedRes.headers.get('content-type')
					if (contentType?.includes('application/json')) {
						const error = await clonedRes.json()
						errorMessage = error?.error || errorMessage
					} else {
						const text = await clonedRes.text()
						errorMessage = text || errorMessage
					}
				} catch {
					// If reading fails, use default message
				}

				throw new Error(errorMessage)
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Team member updated successfully! ✨')
			queryClient.invalidateQueries({
				queryKey: ['supabase', 'project-team', variables.projectSlug],
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to update team member', {
				description: error.message,
			})
		},
	})

	const deleteMember = useMutation<
		{ message: string },
		Error,
		DeleteTeamMemberRequest
	>({
		mutationFn: async (data) => {
			const res = await fetch(
				`/api/projects/${data.projectSlug}/team?projectId=${data.projectId}&memberId=${data.memberId}`,
				{
					method: 'DELETE',
				},
			)

			if (!res.ok) {
				const clonedRes = res.clone()
				let errorMessage = 'Failed to remove team member'

				try {
					const contentType = clonedRes.headers.get('content-type')
					if (contentType?.includes('application/json')) {
						const error = await clonedRes.json()
						errorMessage = error?.error || errorMessage
					} else {
						const text = await clonedRes.text()
						errorMessage = text || errorMessage
					}
				} catch {
					// If reading fails, use default message
				}

				throw new Error(errorMessage)
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Team member removed successfully')
			queryClient.invalidateQueries({
				queryKey: ['supabase', 'project-team', variables.projectSlug],
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to remove team member', {
				description: error.message,
			})
		},
	})

	return {
		createMember,
		updateMember,
		deleteMember,
	}
}
