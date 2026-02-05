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
				// Clone response to avoid "body stream already read" error
				const clonedRes = res.clone()
				let errorMessage = 'Failed to submit pitch'

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
