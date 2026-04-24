import { z } from 'zod'

export const recordStreakSchema = z.object({
	period: z.enum(['weekly', 'monthly'], {
		required_error: 'Period is required',
		invalid_type_error: 'Period must be "weekly" or "monthly"',
	}),
	donation_timestamp: z.string().optional(),
	user_address: z.string().optional(),
})
