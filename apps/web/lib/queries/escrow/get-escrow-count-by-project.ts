import type { TypedSupabaseClient } from '@packages/lib/types'

/**
 * Get the count of existing escrows for a project.
 * This is used to generate consecutive numbers for escrow titles and engagement IDs.
 */
export async function getEscrowCountByProject(
	client: TypedSupabaseClient,
	projectId: string,
): Promise<number> {
	const { count, error } = await client
		.from('escrow_contracts')
		.select('*', { count: 'exact', head: true })
		.eq('project_id', projectId)

	if (error) {
		console.error('Error counting escrows:', error)
		// Return 0 on error to default to 1 for the first escrow
		return 0
	}

	return count ?? 0
}
