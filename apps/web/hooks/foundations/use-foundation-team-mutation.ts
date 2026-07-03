'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateTeamMemberData } from '~/lib/types/project/project-team.types'

type CreateFoundationTeamMemberRequest = CreateTeamMemberData & {
	foundationId: string
	foundationSlug: string
}

type DeleteFoundationTeamMemberRequest = {
	foundationId: string
	foundationSlug: string
	memberId: string
}

type TeamMemberResponse = {
	message: string
	member?: {
		id: string
		foundationId: string
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
}

export function useFoundationTeamMutation() {
	const queryClient = useQueryClient()

	const createMember = useMutation<TeamMemberResponse, Error, CreateFoundationTeamMemberRequest>({
		mutationFn: async (data) => {
			const body =
				data.type === 'manual'
					? {
							type: 'manual' as const,
							foundationId: data.foundationId,
							fullName: data.fullName,
							roleTitle: data.roleTitle,
							bio: data.bio,
							photoUrl: data.photoUrl,
							yearsInvolved: data.yearsInvolved,
						}
					: {
							type: 'registered' as const,
							foundationId: data.foundationId,
							userId: data.userId,
							roleTitle: data.roleTitle,
							bio: data.bio,
						}

			const res = await fetch(`/api/foundations/${data.foundationSlug}/team`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
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
				queryKey: ['supabase', 'foundation-team', variables.foundationSlug],
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to add team member', {
				description: error.message,
			})
		},
	})

	const deleteMember = useMutation<{ message: string }, Error, DeleteFoundationTeamMemberRequest>({
		mutationFn: async (data) => {
			const res = await fetch(
				`/api/foundations/${data.foundationSlug}/team?foundationId=${data.foundationId}&memberId=${data.memberId}`,
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
				queryKey: ['supabase', 'foundation-team', variables.foundationSlug],
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
		deleteMember,
	}
}
