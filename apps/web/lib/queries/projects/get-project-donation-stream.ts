import type { TypedSupabaseClient } from '@packages/lib/types'

export interface DonationStreamItem {
	id: string
	donatedAt: string
}

const DEFAULT_LIMIT = 15
const MAX_LIMIT = 50

export async function getProjectDonationStream(
	client: TypedSupabaseClient,
	projectId: string,
	limit = DEFAULT_LIMIT,
): Promise<DonationStreamItem[]> {
	const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT)

	const { data, error } = await client
		.from('contributions')
		.select('id, created_at')
		.eq('project_id', projectId)
		.gt('amount', 0)
		.order('created_at', { ascending: false })
		.limit(safeLimit)

	if (error) throw error

	return (data ?? []).map((row) => ({
		id: row.id,
		donatedAt: row.created_at ?? new Date().toISOString(),
	}))
}
