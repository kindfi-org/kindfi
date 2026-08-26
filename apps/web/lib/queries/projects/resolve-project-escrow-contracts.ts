import type { TypedSupabaseClient } from '@packages/lib/types'
import type { EscrowType } from '@trustless-work/escrow'
import { readEscrowTypeFromMetadata } from '~/lib/utils/escrow/resolve-escrow-type'

export type ProjectEscrowsRelation =
	| { escrow_id?: string | null }
	| Array<{ escrow_id?: string | null }>
	| null
	| undefined

export function getProjectEscrowRowId(relation: ProjectEscrowsRelation): string | undefined {
	if (!relation) return undefined
	if (Array.isArray(relation)) return relation[0]?.escrow_id ?? undefined
	return relation.escrow_id ?? undefined
}

export type ResolvedProjectEscrow = {
	escrowContractAddress?: string
	escrowType?: EscrowType
}

/** Resolve Stellar contract IDs (and escrow type) from project_escrows row UUIDs. */
export async function resolveProjectEscrowContracts(
	client: TypedSupabaseClient,
	escrowRowIds: string[],
): Promise<Map<string, ResolvedProjectEscrow>> {
	const uniqueIds = [...new Set(escrowRowIds.filter(Boolean))]
	const resolved = new Map<string, ResolvedProjectEscrow>()

	if (uniqueIds.length === 0) {
		return resolved
	}

	const { data, error } = await client
		.from('escrow_contracts')
		.select('id, contract_id, metadata')
		.in('id', uniqueIds)

	if (error) throw error

	for (const row of data ?? []) {
		if (!row.contract_id) continue

		resolved.set(row.id, {
			escrowContractAddress: row.contract_id,
			escrowType: readEscrowTypeFromMetadata(row.metadata),
		})
	}

	return resolved
}

export async function resolveEscrowForProjectRow(
	client: TypedSupabaseClient,
	escrowRowId: string | undefined,
): Promise<ResolvedProjectEscrow> {
	if (!escrowRowId) return {}

	const map = await resolveProjectEscrowContracts(client, [escrowRowId])
	return map.get(escrowRowId) ?? {}
}
