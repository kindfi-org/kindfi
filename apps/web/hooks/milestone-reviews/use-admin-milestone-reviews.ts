'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
	AdminMilestoneReviewRequest,
	MilestoneReviewStatus,
} from '~/lib/types/milestone-review-request'

export type AdminReviewFilter = MilestoneReviewStatus | 'all'

const adminMilestoneReviewQueryKey = (status: AdminReviewFilter) =>
	['admin-milestone-reviews', status] as const

export const useAdminMilestoneReviews = (status: AdminReviewFilter = 'pending') => {
	return useQuery({
		queryKey: adminMilestoneReviewQueryKey(status),
		queryFn: async (): Promise<AdminMilestoneReviewRequest[]> => {
			const response = await fetch(`/api/admin/milestone-reviews?status=${status}`)
			const payload = (await response.json().catch(() => ({}))) as {
				error?: string
				requests?: AdminMilestoneReviewRequest[]
			}

			if (!response.ok) {
				throw new Error(payload.error || 'Failed to load milestone review queue')
			}

			return payload.requests ?? []
		},
	})
}

export const useUpdateMilestoneReviewRequest = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			status,
			reviewNotes,
		}: {
			id: string
			status: 'approved' | 'rejected'
			reviewNotes?: string
		}) => {
			const response = await fetch(`/api/admin/milestone-reviews/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status, reviewNotes }),
			})

			const payload = (await response.json().catch(() => ({}))) as { error?: string }

			if (!response.ok) {
				throw new Error(payload.error || 'Failed to update review request')
			}

			return payload
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['admin-milestone-reviews'] })
		},
	})
}
