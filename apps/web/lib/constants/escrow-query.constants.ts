import type { EscrowType } from '@trustless-work/escrow'

/** Shared React Query timing for on-chain escrow reads (balances + released). */
export const ESCROW_QUERY_STALE_MS = 30_000
export const ESCROW_QUERY_POLL_MS = 30_000

export const escrowBalanceQueryKey = (address: string, type: EscrowType) =>
	['escrow-balance', address, type] as const

export const escrowReleasedQueryKey = (address: string) => ['escrow-released', address] as const

export const escrowDataQueryKey = (address: string) => ['escrow-data', address] as const
