import type { TypedSupabaseClient } from '@packages/lib/types'
import type { AdminDashboardStats } from '~/lib/validators/admin-dashboard-stats'
import { type AdminQueueSection, getActionQueues } from './get-action-queues'
import { getDashboardStats } from './get-dashboard-stats'

export interface AdminActionQueuePayload {
	queues: AdminQueueSection[]
	stats: AdminDashboardStats | null
	statsError: boolean
}

/**
 * Full action-center read model, shared by the API route and the server
 * prefetch so both produce the identical payload for one query key.
 * Stats and queues degrade independently.
 */
export async function getActionQueuePayload(
	client: TypedSupabaseClient,
): Promise<AdminActionQueuePayload> {
	const [queues, statsResult] = await Promise.all([
		getActionQueues(client),
		getDashboardStats(client).then(
			(stats) => ({ stats, statsError: false as const }),
			() => ({ stats: null, statsError: true as const }),
		),
	])

	return { queues, ...statsResult }
}
