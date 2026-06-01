'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { parseApiError, teamQueryKey } from './team-api-utils'
import type {
	CreateTeamMemberRequest,
	DeleteTeamMemberRequest,
	TeamMemberResponse,
	UpdateTeamMemberRequest,
} from './team-mutation.types'

export const useCreateTeamMemberMutation = () => {
	const queryClient = useQueryClient()

	return useMutation<TeamMemberResponse, Error, CreateTeamMemberRequest>({
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
				throw new Error(
					await parseApiError(res, 'Failed to add team member'),
				)
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Team member added successfully! 🎉')
			queryClient.invalidateQueries({
				queryKey: teamQueryKey(variables.projectSlug),
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to add team member', {
				description: error.message,
			})
		},
	})
}

export const useUpdateTeamMemberMutation = () => {
	const queryClient = useQueryClient()

	return useMutation<TeamMemberResponse, Error, UpdateTeamMemberRequest>({
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
				throw new Error(
					await parseApiError(res, 'Failed to update team member'),
				)
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Team member updated successfully! ✨')
			queryClient.invalidateQueries({
				queryKey: teamQueryKey(variables.projectSlug),
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to update team member', {
				description: error.message,
			})
		},
	})
}

export const useDeleteTeamMemberMutation = () => {
	const queryClient = useQueryClient()

	return useMutation<{ message: string }, Error, DeleteTeamMemberRequest>({
		mutationFn: async (data) => {
			const res = await fetch(
				`/api/projects/${data.projectSlug}/team?projectId=${data.projectId}&memberId=${data.memberId}`,
				{
					method: 'DELETE',
				},
			)

			if (!res.ok) {
				throw new Error(
					await parseApiError(res, 'Failed to remove team member'),
				)
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Team member removed successfully')
			queryClient.invalidateQueries({
				queryKey: teamQueryKey(variables.projectSlug),
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to remove team member', {
				description: error.message,
			})
		},
	})
}
