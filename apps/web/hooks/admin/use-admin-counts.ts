'use client'

import type { AdminDashboardStats } from '~/lib/validators/admin-dashboard-stats'
import { useAdminQuery } from './use-admin-query'

interface AdminCountsResponse {
	stats: AdminDashboardStats | null
	statsError: boolean
}

const COUNTS_STALE_MS = 60_000

/**
 * Lightweight dashboard counts (stats only, no queue items). Shared by the
 * navigation badges and the KYC stats bar under one stable query key.
 */
export function useAdminCounts() {
	return useAdminQuery<AdminCountsResponse>('nav-counts', {
		path: 'action-queue',
		params: { countsOnly: 'true' },
		staleTime: COUNTS_STALE_MS,
	})
}
