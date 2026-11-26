import type { TypedSupabaseClient } from '@packages/lib/types'
import {
	type AdminDashboardStats,
	adminDashboardStatsSchema,
} from '~/lib/validators/admin-dashboard-stats'

/**
 * Fetches all admin dashboard counts through the `get_admin_dashboard_stats`
 * RPC — a single aggregate query instead of downloading full tables and
 * counting rows in application code.
 */
export async function getDashboardStats(client: TypedSupabaseClient): Promise<AdminDashboardStats> {
	const { data, error } = await client.rpc('get_admin_dashboard_stats')

	if (error) {
		throw new Error(`Failed to load admin dashboard stats: ${error.message}`)
	}

	return adminDashboardStatsSchema.parse(data)
}
