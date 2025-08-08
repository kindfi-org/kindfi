'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type ProjectPitchFormData = {
	projectId: string
	projectSlug: string
	title: string
	story: string
	videoUrl: string | null
	pitchDeck: File | string | null
}

export function useProjectPitchMutation() {
	return useMutation({
		mutationFn: async (formData: ProjectPitchFormData) => {
			const fd = new FormData()

			fd.append('projectId', formData.projectId)
			fd.append('title', formData.title)
			fd.append('story', formData.story)

			if (formData.videoUrl) {
				fd.append('videoUrl', formData.videoUrl)
			}

			if (formData.pitchDeck instanceof File) {
				fd.append('pitchDeck', formData.pitchDeck)
			}

			const res = await fetch(`/api/projects/${formData.projectSlug}/pitch`, {
				method: 'POST',
				body: fd,
			})

			if (!res.ok) {
				const error = await res.json()
				throw new Error(error.error || 'Failed to submit pitch')
			}

			return res.json()
		},
		onSuccess: () => {
			toast.success('Pitch saved successfully 🎉', {
				description: 'All your changes have been recorded successfully.',
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to save pitch', {
				description: error.message,
			})
		},
	})
}
