'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Highlight {
	id: string
	title: string
	description: string
}

type HighlightsRequestData = {
	projectId: string
	projectSlug: string
	highlights: Highlight[]
}

type HighlightsSaveResponse = { message: string }

export function useHighlightsMutation() {
	const queryClient = useQueryClient()

	return useMutation<HighlightsSaveResponse, Error, HighlightsRequestData>({
		mutationFn: async (data: HighlightsRequestData) => {
			const res = await fetch(`/api/projects/${data.projectSlug}/highlights`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					projectId: data.projectId,
					highlights: data.highlights,
				}),
			})

			if (!res.ok) {
				// Clone response to avoid "body stream already read" error
				const clonedRes = res.clone()
				let errorMessage = 'Failed to save highlights'

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
			toast.success('Highlights saved successfully! 🎉', {
				description: 'All your highlights have been saved successfully.',
			})
			queryClient.invalidateQueries({
				queryKey: ['project', variables.projectSlug],
			})
			queryClient.invalidateQueries({
				queryKey: ['basic-project-info', variables.projectSlug],
			})
		},
		onError: (error: Error) => {
			toast.error('Failed to save highlights', {
				description: error.message,
			})
		},
	})
}
