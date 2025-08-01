'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

export function useCreateProjectMutation() {
	return useMutation({
		mutationFn: async (formData: CreateProjectFormData) => {
			const fd = new FormData()

			fd.append('title', formData.title)
			fd.append('description', formData.description)
			fd.append('targetAmount', String(formData.targetAmount))
			fd.append('minimumInvestment', String(formData.minimumInvestment))

			if (formData.image) {
				fd.append('image', formData.image)
			}

			if (formData.website) {
				fd.append('website', formData.website)
			}

			fd.append('location', formData.location)
			fd.append('category', formData.category)
			fd.append('tags', JSON.stringify(formData.tags))
			fd.append('socialLinks', JSON.stringify(formData.socialLinks))

			const res = await fetch('/api/projects/create', {
				method: 'POST',
				body: fd,
			})

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.error || 'Failed to create project')
			}

			return res.json()
		},
		onSuccess: (data) => {
			toast.success('Project Created Successfully! 🎉', {
				description: `Your project "${data.title}" has been created.\nYou have 7 days to complete your project setup.`,
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to create project', {
				description: error.message,
			})
		},
	})
}
