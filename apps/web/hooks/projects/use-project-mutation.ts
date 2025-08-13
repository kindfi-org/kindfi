'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

type UseProjectMutationOptions = {
	projectId?: string // If present, triggers update; otherwise, create
}

export function useProjectMutation({ projectId }: UseProjectMutationOptions) {
	return useMutation({
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
				projectId ? '/api/projects/update' : '/api/projects/create',
				{
					method: projectId ? 'PATCH' : 'POST',
					body: fd,
				},
			)

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.error || 'Failed to submit project')
			}

			return res.json()
		},
		onSuccess: (data) => {
			toast.success(
				projectId
					? 'Project Updated Successfully 🎉'
					: 'Project Created Successfully! 🎉',
				{
					description: projectId
						? 'Your changes have been saved.'
						: `Your project "${data.title}" has been created.\nYou have 7 days to complete your project setup.`,
				},
			)
		},
		onError: (error: Error) => {
			toast.error(
				projectId ? 'Failed to update project' : 'Failed to create project',
				{
					description: error.message,
				},
			)
		},
	})
}
