import { z } from 'zod'
import { MILESTONE_REVIEW_STATUSES } from '~/lib/types/milestone-review-request'

export const createMilestoneReviewRequestSchema = z.object({
	milestoneIndex: z.number().int().min(0),
	requestNotes: z.string().trim().max(2000).optional(),
	milestoneTitle: z.string().trim().max(500).optional(),
})

export const updateMilestoneReviewRequestSchema = z.object({
	status: z.enum(['approved', 'rejected']),
	reviewNotes: z.string().trim().max(2000).optional(),
})

export const adminMilestoneReviewListQuerySchema = z.object({
	status: z
		.enum([...MILESTONE_REVIEW_STATUSES, 'all'])
		.optional()
		.default('pending'),
})
