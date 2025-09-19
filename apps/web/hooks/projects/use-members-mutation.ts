'use client'

import type { Enums } from '@services/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type CommonPayload = {
	projectId: string
	projectSlug: string
	memberId: string
}

type UpdateRolePayload = CommonPayload & {
	role: Enums<'project_member_role'>
}

type UpdateTitlePayload = CommonPayload & {
	title: string
}

type RemoveMemberPayload = CommonPayload

type MemberMutationResponse = { message: string }

export function useMembersMutation() {
	const queryClient = useQueryClient()

	// PATCH role
	const updateRole = useMutation<
		MemberMutationResponse,
		Error,
		UpdateRolePayload
	>({
		mutationFn: async (payload) => {
			const fd = new FormData()
			fd.append('projectId', payload.projectId)
			fd.append('memberId', payload.memberId)
			fd.append('role', payload.role)

			const res = await fetch(`/api/projects/${payload.projectSlug}/members`, {
				method: 'PATCH',
				body: fd,
			})

			if (!res.ok) {
				try {
					const error = await res.json()
					throw new Error(error?.error || 'Failed to update role')
				} catch {
					const text = await res.text()
					throw new Error(text || 'Failed to update role')
				}
			}
			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Member role updated successfully! 🎉')
			queryClient.invalidateQueries({
				queryKey: ['project-members', variables.projectSlug],
			})
			queryClient.invalidateQueries({
				queryKey: ['project', variables.projectSlug],
			})
		},
		onError: (error) => {
			toast.error('Failed to update role', { description: error.message })
		},
	})

	// PATCH title
	const updateTitle = useMutation<
		MemberMutationResponse,
		Error,
		UpdateTitlePayload
	>({
		mutationFn: async (payload) => {
			const fd = new FormData()
			fd.append('projectId', payload.projectId)
			fd.append('memberId', payload.memberId)
			fd.append('title', payload.title)

			const res = await fetch(`/api/projects/${payload.projectSlug}/members`, {
				method: 'PATCH',
				body: fd,
			})

			if (!res.ok) {
				try {
					const error = await res.json()
					throw new Error(error?.error || 'Failed to update title')
				} catch {
					const text = await res.text()
					throw new Error(text || 'Failed to update title')
				}
			}
			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Member title updated successfully! 🎉')
			queryClient.invalidateQueries({
				queryKey: ['project-members', variables.projectSlug],
			})
			queryClient.invalidateQueries({
				queryKey: ['project', variables.projectSlug],
			})
		},
		onError: (error) => {
			toast.error('Failed to update title', { description: error.message })
		},
	})

	// DELETE member
	const removeMember = useMutation<
		MemberMutationResponse,
		Error,
		RemoveMemberPayload
	>({
		mutationFn: async (payload) => {
			const fd = new FormData()
			fd.append('projectId', payload.projectId)
			fd.append('memberId', payload.memberId)

			const res = await fetch(`/api/projects/${payload.projectSlug}/members`, {
				method: 'DELETE',
				body: fd,
			})

			if (!res.ok) {
				try {
					const error = await res.json()
					throw new Error(error?.error || 'Failed to remove member')
				} catch {
					const text = await res.text()
					throw new Error(text || 'Failed to remove member')
				}
			}
			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Member removed successfully! 🎉')
			queryClient.invalidateQueries({
				queryKey: ['project-members', variables.projectSlug],
			})
			queryClient.invalidateQueries({
				queryKey: ['project', variables.projectSlug],
			})
		},
		onError: (error) => {
			toast.error('Failed to remove member', { description: error.message })
		},
	})

	return { updateRole, updateTitle, removeMember }
}
