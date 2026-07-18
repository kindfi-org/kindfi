'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MilestoneReviewRequestWithRequester } from '~/lib/types/milestone-review-request'

const milestoneReviewQueryKey = (slug: string) => ['milestone-review-requests', slug] as const

export const useMilestoneReviewRequests = (slug: string) => {
	return useQuery({
		queryKey: milestoneReviewQueryKey(slug),
		queryFn: async (): Promise<MilestoneReviewRequestWithRequester[]> => {
			const response = await fetch(`/api/projects/${slug}/manage/milestone-reviews`)
			const payload = (await response.json().catch(() => ({}))) as {
				error?: string
				requests?: MilestoneReviewRequestWithRequester[]
			}

			if (!response.ok) {
				throw new Error(payload.error || 'Failed to load milestone review requests')
			}

			return payload.requests ?? []
		},
	})
}

export const useCreateMilestoneReviewRequest = (slug: string) => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			milestoneIndex,
			requestNotes,
			milestoneTitle,
		}: {
			milestoneIndex: number
			requestNotes?: string
			milestoneTitle?: string
		}) => {
			const response = await fetch(`/api/projects/${slug}/manage/milestone-reviews`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ milestoneIndex, requestNotes, milestoneTitle }),
			})

			const payload = (await response.json().catch(() => ({}))) as { error?: string }

			if (!response.ok) {
				throw new Error(payload.error || 'Failed to submit review request')
			}

			return payload
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: milestoneReviewQueryKey(slug) })
		},
	})
}
