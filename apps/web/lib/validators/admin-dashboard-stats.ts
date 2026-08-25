import { z } from 'zod'

const countRecord = z.record(z.string(), z.number()).catch({})

/**
 * Shape of the `get_admin_dashboard_stats` RPC payload. Parsed with Zod so
 * schema drift fails loudly instead of rendering wrong numbers.
 */
export const adminDashboardStatsSchema = z.object({
	projects: z.object({
		total: z.number(),
		by_status: countRecord,
		dev_only: z.number(),
		without_escrow: z.number(),
	}),
	escrows: z.object({
		total: z.number(),
		by_state: countRecord,
	}),
	users: z.object({
		total: z.number(),
		by_role: countRecord,
		new_today: z.number(),
		new_week: z.number(),
		new_month: z.number(),
	}),
	kyc: z.object({
		not_started: z.number(),
		pending: z.number(),
		approved: z.number(),
		rejected: z.number(),
	}),
	milestone_reviews: z.object({
		pending: z.number(),
	}),
	contributions: z.object({
		count: z.number(),
		total_amount: z.number(),
	}),
	foundations: z.object({
		total: z.number(),
	}),
	governance: z.object({
		rounds_total: z.number(),
		rounds_active: z.number(),
	}),
	generated_at: z.string(),
})

export type AdminDashboardStats = z.infer<typeof adminDashboardStatsSchema>
