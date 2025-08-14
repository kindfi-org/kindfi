'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

type CreateProjectResponse = {
	slug: string
}

type UpdateProjectResponse = {
	message: string
}

type UseProjectMutationOptions = {
	projectId?: string // If present, triggers update; otherwise, create
}

export function useProjectMutation({ projectId }: UseProjectMutationOptions) {
	const queryClient = useQueryClient()
	const isUpdate = Boolean(projectId)

	return useMutation<
		CreateProjectResponse | UpdateProjectResponse,
		Error,
		CreateProjectFormData
	>({
		mutationFn: async (formData: CreateProjectFormData) => {
			const fd = new FormData()

			if (projectId) {
				fd.append('projectId', projectId)
			}

			if (formData.slug) {
				fd.append('slug', formData.slug)
			}

			fd.append('title', formData.title)
			fd.append('description', formData.description)
			fd.append('targetAmount', String(formData.targetAmount))
			fd.append('minimumInvestment', String(formData.minimumInvestment))

			if (formData.image instanceof File) {
				fd.append('image', formData.image)
			} else if (formData.image === null) {
				fd.append('removeImage', 'true')
			}

			if (formData.website) {
				fd.append('website', formData.website)
			}

			fd.append('location', formData.location)
			fd.append('category', formData.category)
			fd.append('tags', JSON.stringify(formData.tags))
			fd.append('socialLinks', JSON.stringify(formData.socialLinks))

			const res = await fetch(
				isUpdate ? '/api/projects/update' : '/api/projects/create',
				{
					method: isUpdate ? 'PATCH' : 'POST',
					body: fd,
				},
			)

			if (!res.ok) {
				try {
					const error = await res.json()
					throw new Error(error?.error || 'Failed to submit project')
				} catch {
					// Fallback for non-JSON responses
					const text = await res.text()
					throw new Error(text || 'Failed to submit project')
				}
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success(
				isUpdate
					? 'Project Updated Successfully! 🎉'
					: 'Project Created Successfully! 🎉',
				{
					description: isUpdate
						? 'Your changes have been saved.'
						: `Your project "${variables.title}" has been created.\nYou have 7 days to complete your project setup.`,
				},
			)
			if (isUpdate) {
				queryClient.invalidateQueries({
					queryKey: ['basic-project-info', variables.slug],
				})
				queryClient.invalidateQueries({
					queryKey: ['project', variables.slug],
				})
			}
			queryClient.invalidateQueries({ queryKey: ['projects'] })
		},
		onError: (error: Error) => {
			toast.error(
				isUpdate ? 'Failed to update project' : 'Failed to create project',
				{
					description: error.message,
				},
			)
		},
	})
}
