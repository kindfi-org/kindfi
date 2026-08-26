import { z } from 'zod'

export const recordStreakSchema = z.object({
	period: z.enum(['weekly', 'monthly'], {
		error: (issue) => {
			if (issue.code === 'invalid_value' && issue.received === 'undefined') {
				return { message: 'Period is required' }
			}
			return `Invalid role. Expected "weekly" or "Monthly, but received "${issue.input}"`
		},
	}),
	donation_timestamp: z.string().optional(),
	user_address: z.string().optional(),
})
