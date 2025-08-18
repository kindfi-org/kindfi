'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ProjectPitchData } from '~/lib/types/project/create-project.types'

type ProjectPitchRequestData = ProjectPitchData & {
	projectId: string
	projectSlug: string
}

type PitchSaveResponse = { message: string }

export function useProjectPitchMutation() {
	const queryClient = useQueryClient()

	return useMutation<PitchSaveResponse, Error, ProjectPitchRequestData>({
		mutationFn: async (formData: ProjectPitchRequestData) => {
			const fd = new FormData()

			fd.append('projectId', formData.projectId)
			fd.append('title', formData.title)
			fd.append('story', formData.story)

			if (formData.videoUrl) {
				fd.append('videoUrl', formData.videoUrl)
			}

			if (formData.pitchDeck instanceof File) {
				fd.append('pitchDeck', formData.pitchDeck)
			} else if (formData.pitchDeck === null) {
				fd.append('removePitchDeck', 'true')
			}

			const res = await fetch(`/api/projects/${formData.projectSlug}/pitch`, {
				method: 'POST',
				body: fd,
			})

			if (!res.ok) {
				try {
					const error = await res.json()
					throw new Error(error?.error || 'Failed to submit pitch')
				} catch {
					// Fallback for non-JSON responses
					const text = await res.text()
					throw new Error(text || 'Failed to submit pitch')
				}
			}

			return res.json()
		},
		onSuccess: (_data, variables) => {
			toast.success('Pitch saved successfully! 🎉', {
				description: 'All your changes have been recorded successfully.',
			})
			queryClient.invalidateQueries({
				queryKey: ['project-pitch', variables.projectSlug],
			})
			queryClient.invalidateQueries({
				queryKey: ['project', variables.projectSlug],
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to save pitch', {
				description: error.message,
			})
		},
	})
}
