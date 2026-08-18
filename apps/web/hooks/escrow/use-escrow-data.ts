'use client'

import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { useCallback, useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { patchMilestoneAtIndex } from '~/lib/utils/escrow/milestone-utils'
import type { EscrowApiVersion } from '~/lib/utils/escrow/resolve-escrow-api-version'

interface UseEscrowDataParams {
	escrowContractAddress: string
	escrowType?: EscrowType
}

/** Single delayed refetch after writes — avoids hammering Trustless Work during indexer sync. */
const POST_TRANSACTION_REFETCH_DELAY_MS = 3_000

type EscrowLookupResponse = {
	escrow: GetEscrowsFromIndexerResponse
	apiVersion?: EscrowApiVersion
}

export function useEscrowData({
	escrowContractAddress,
	escrowType: _escrowType,
}: UseEscrowDataParams) {
	const [escrowData, setEscrowData] = useState<GetEscrowsFromIndexerResponse | null>(null)
	const [escrowApiVersion, setEscrowApiVersion] = useState<EscrowApiVersion | undefined>(undefined)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const normalizeEscrowResponse = useCallback(
		(response: GetEscrowsFromIndexerResponse): GetEscrowsFromIndexerResponse => {
			if (!response.engagementId) {
				throw new Error('Invalid response: missing engagementId')
			}

			return {
				...response,
				createdAt:
					response.createdAt &&
					typeof response.createdAt === 'object' &&
					'_seconds' in response.createdAt
						? (new Date(
								(
									response.createdAt as {
										_seconds: number
										_nanoseconds?: number
									}
								)._seconds * 1000,
							) as unknown as Date)
						: response.createdAt,
				updatedAt:
					response.updatedAt &&
					typeof response.updatedAt === 'object' &&
					'_seconds' in response.updatedAt
						? (new Date(
								(
									response.updatedAt as {
										_seconds: number
										_nanoseconds?: number
									}
								)._seconds * 1000,
							) as unknown as Date)
						: response.updatedAt,
			} as unknown as GetEscrowsFromIndexerResponse
		},
		[],
	)

	const fetchEscrowData = useCallback(
		async (options?: { silent?: boolean }) => {
			if (!escrowContractAddress) return

			const silent = options?.silent ?? false

			try {
				if (!silent) {
					setIsLoading(true)
					setError(null)
				}

				const response = await fetch(
					`/api/escrow/by-contract-id?contractId=${encodeURIComponent(escrowContractAddress)}`,
					{ cache: 'no-store' },
				)

				if (!response.ok) {
					const payload = (await response.json().catch(() => null)) as { error?: string } | null
					throw new Error(payload?.error ?? 'No escrow found for this contract ID')
				}

				const payload = (await response.json()) as EscrowLookupResponse
				setEscrowData(normalizeEscrowResponse(payload.escrow))
				setEscrowApiVersion(payload.apiVersion)
			} catch (err) {
				logger.error('Failed to fetch escrow data:', err)
				const errorMessage = err instanceof Error ? err.message : 'Failed to load escrow data'
				if (!silent) {
					setError(errorMessage)
					setEscrowData(null)
					setEscrowApiVersion(undefined)
				}
			} finally {
				if (!silent) {
					setIsLoading(false)
				}
			}
		},
		[escrowContractAddress, normalizeEscrowResponse],
	)

	const refetchAfterTransaction = useCallback(async () => {
		await new Promise((resolve) => setTimeout(resolve, POST_TRANSACTION_REFETCH_DELAY_MS))
		await fetchEscrowData({ silent: true })
	}, [fetchEscrowData])

	const patchMilestone = useCallback(
		(
			index: number,
			patch: { kind: 'approve' } | { kind: 'status'; status: string; evidence?: string },
		) => {
			setEscrowData((current) => {
				if (!current?.milestones?.length) {
					return current
				}

				return {
					...current,
					milestones: patchMilestoneAtIndex(
						current.milestones as (SingleReleaseMilestone | MultiReleaseMilestone)[],
						index,
						patch,
					),
				}
			})
		},
		[],
	)

	useEffect(() => {
		fetchEscrowData()
	}, [fetchEscrowData])

	return {
		escrowData,
		escrowApiVersion,
		isLoading,
		error,
		refetch: fetchEscrowData,
		refetchAfterTransaction,
		patchMilestone,
	}
}
