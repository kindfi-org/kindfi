import type { TypedSupabaseClient } from '@packages/lib/types'

export interface FoundationManageMeta {
	id: string
	name: string
	founderId: string
}

/**
 * Lightweight fetch for manage layout: id, name, founder_id only.
 * Use for auth/authorization checks without loading full foundation.
 */
export async function getFoundationManageMeta(
	client: TypedSupabaseClient,
	slug: string,
): Promise<FoundationManageMeta | null> {
	const { data, error } = await client
		.from('foundations')
		.select('id, name, founder_id')
		.eq('slug', slug)
		.maybeSingle()

	if (error) {
		console.error('Error fetching foundation meta:', error)
		throw error
	}

	if (!data) {
		return null
	}

	const row = data as { id: string; name: string; founder_id: string }
	return {
		id: row.id,
		name: row.name,
		founderId: row.founder_id,
	}
}
