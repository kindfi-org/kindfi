'use client'

import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { patchMilestoneAtIndex } from '~/lib/utils/escrow/milestone-utils'

interface UseEscrowDataParams {
	escrowContractAddress: string
	escrowType?: EscrowType
}

const INDEXER_SYNC_DELAYS_MS = [0, 2_000, 5_000] as const

export function useEscrowData({
	escrowContractAddress,
	escrowType: _escrowType,
}: UseEscrowDataParams) {
	const { getEscrowByContractIds } = useEscrow()
	const [escrowData, setEscrowData] = useState<GetEscrowsFromIndexerResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const normalizeEscrowResponse = useCallback(
		(response: unknown): GetEscrowsFromIndexerResponse => {
			let escrow: GetEscrowsFromIndexerResponse | null = null

			if (Array.isArray(response)) {
				if (response.length === 0) {
					throw new Error('No escrow found for this contract ID')
				}
				escrow = response[0] as GetEscrowsFromIndexerResponse
			} else if (response && typeof response === 'object') {
				escrow = response as GetEscrowsFromIndexerResponse
			} else {
				throw new Error('Invalid response format from escrow API')
			}

			if (!escrow.engagementId) {
				throw new Error('Invalid response: missing engagementId')
			}

			return {
				...escrow,
				createdAt:
					escrow.createdAt && typeof escrow.createdAt === 'object' && '_seconds' in escrow.createdAt
						? (new Date(
								(
									escrow.createdAt as {
										_seconds: number
										_nanoseconds?: number
									}
								)._seconds * 1000,
							) as unknown as Date)
						: escrow.createdAt,
				updatedAt:
					escrow.updatedAt && typeof escrow.updatedAt === 'object' && '_seconds' in escrow.updatedAt
						? (new Date(
								(
									escrow.updatedAt as {
										_seconds: number
										_nanoseconds?: number
									}
								)._seconds * 1000,
							) as unknown as Date)
						: escrow.updatedAt,
			} as unknown as GetEscrowsFromIndexerResponse
		},
		[],
	)

	const fetchEscrowData = useCallback(
		async (options?: { validateOnChain?: boolean; silent?: boolean }) => {
			if (!escrowContractAddress) return

			const validateOnChain = options?.validateOnChain ?? false
			const silent = options?.silent ?? false

			try {
				if (!silent) {
					setIsLoading(true)
					setError(null)
				}

				const response = await getEscrowByContractIds({
					contractIds: [escrowContractAddress],
					validateOnChain,
				})

				setEscrowData(normalizeEscrowResponse(response))
			} catch (err) {
				logger.error('Failed to fetch escrow data:', err)
				const errorMessage = err instanceof Error ? err.message : 'Failed to load escrow data'
				if (!silent) {
					setError(errorMessage)
					toast.error(errorMessage)
					setEscrowData(null)
				}
			} finally {
				if (!silent) {
					setIsLoading(false)
				}
			}
		},
		[escrowContractAddress, getEscrowByContractIds, normalizeEscrowResponse],
	)

	const refetchAfterTransaction = useCallback(async () => {
		for (const delayMs of INDEXER_SYNC_DELAYS_MS) {
			if (delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, delayMs))
			}
			await fetchEscrowData({ validateOnChain: true, silent: true })
		}
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
		isLoading,
		error,
		refetch: fetchEscrowData,
		refetchAfterTransaction,
		patchMilestone,
	}
}
