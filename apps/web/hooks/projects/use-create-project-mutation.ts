'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

export function useCreateProjectMutation() {
	return useMutation({
		mutationFn: async (formData: CreateProjectFormData) => {
			const res = await fetch('/api/projects/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
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
