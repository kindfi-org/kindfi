'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type ProjectUpdatePayload = {
	projectId: string
	projectSlug: string
	title?: string
	content: string
}

type ProjectUpdatePatchPayload = ProjectUpdatePayload & {
	updateId: string
}

type ProjectUpdateDeletePayload = {
	projectId: string
	projectSlug: string
	updateId: string
}

const parseApiError = async (res: Response, fallback: string) => {
	const clonedRes = res.clone()
	try {
		const contentType = clonedRes.headers.get('content-type')
		if (contentType?.includes('application/json')) {
			const error = await clonedRes.json()
			return error?.error || fallback
		}
		const text = await clonedRes.text()
		return text || fallback
	} catch {
		return fallback
	}
}

const invalidateProjectUpdateQueries = (
	queryClient: ReturnType<typeof useQueryClient>,
	projectSlug: string,
) => {
	queryClient.invalidateQueries({ queryKey: ['project-updates-manage', projectSlug] })
	queryClient.invalidateQueries({ queryKey: ['project', projectSlug] })
}

export function useProjectUpdatesMutation() {
	const queryClient = useQueryClient()

	const createUpdate = useMutation({
		mutationFn: async (data: ProjectUpdatePayload) => {
			const res = await fetch(`/api/projects/${data.projectSlug}/updates`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: data.projectId,
					title: data.title,
					content: data.content,
				}),
			})

			if (!res.ok) {
				throw new Error(await parseApiError(res, 'Failed to post update'))
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Update posted')
			invalidateProjectUpdateQueries(queryClient, variables.projectSlug)
		},
		onError: (error: Error) => {
			toast.error('Failed to post update', { description: error.message })
		},
	})

	const editUpdate = useMutation({
		mutationFn: async (data: ProjectUpdatePatchPayload) => {
			const res = await fetch(`/api/projects/${data.projectSlug}/updates/${data.updateId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: data.projectId,
					title: data.title,
					content: data.content,
				}),
			})

			if (!res.ok) {
				throw new Error(await parseApiError(res, 'Failed to save update'))
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Update saved')
			invalidateProjectUpdateQueries(queryClient, variables.projectSlug)
		},
		onError: (error: Error) => {
			toast.error('Failed to save update', { description: error.message })
		},
	})

	const deleteUpdate = useMutation({
		mutationFn: async (data: ProjectUpdateDeletePayload) => {
			const res = await fetch(`/api/projects/${data.projectSlug}/updates/${data.updateId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ projectId: data.projectId }),
			})

			if (!res.ok) {
				throw new Error(await parseApiError(res, 'Failed to delete update'))
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Update deleted')
			invalidateProjectUpdateQueries(queryClient, variables.projectSlug)
		},
		onError: (error: Error) => {
			toast.error('Failed to delete update', { description: error.message })
		},
	})

	return {
		createUpdate,
		editUpdate,
		deleteUpdate,
		isPending: createUpdate.isPending || editUpdate.isPending || deleteUpdate.isPending,
	}
}
