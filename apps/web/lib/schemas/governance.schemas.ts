import { z } from 'zod'

export const governanceRoundsQuerySchema = z.object({
	status: z.enum(['upcoming', 'active', 'ended']).optional(),
})

export const createGovernanceRoundSchema = z.object({
	round: z.object({
		title: z.string().min(1, 'Title is required'),
		description: z.string().optional().nullable(),
		startsAt: z.string().datetime(),
		endsAt: z.string().datetime(),
		totalFundAmount: z.number().optional().default(0),
		fundCurrency: z.string().optional().default('XLM'),
	}),
	options: z
		.array(
			z.object({
				title: z.string().min(1),
				description: z.string().optional().nullable(),
				projectSlug: z.string().optional().nullable(),
				imageUrl: z.string().url().optional().nullable(),
			}),
		)
		.optional()
		.default([]),
})

export const castVoteSchema = z.object({
	roundId: z.string().uuid('Invalid round ID'),
	optionId: z.string().uuid('Invalid option ID'),
	voteType: z.enum(['up', 'down']),
})

export const governanceRoundIdParamSchema = z.object({
	id: z.string().uuid('Invalid round ID'),
})
