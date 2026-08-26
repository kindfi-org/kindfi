'use client'

import { useQuery } from '@tanstack/react-query'
import type { EscrowType, GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { useMemo, useRef } from 'react'
import { useOptionalEscrow } from '~/hooks/contexts/use-escrow.context'
import {
	ESCROW_QUERY_POLL_MS,
	ESCROW_QUERY_STALE_MS,
	escrowReleasedQueryKey,
} from '~/lib/constants/escrow-query.constants'
import {
	calculateReleasedAmountFromEscrow,
	calculateReleasedProgressPercent,
	type ReleasableMilestone,
	resolveDisplayReleasedAmount,
} from '~/lib/utils/projects/milestone-funding'
import { projectHasEscrow } from '~/lib/utils/projects/project-funding'

interface UseProjectReleasedDisplayParams {
	escrowContractAddress?: string | null
	escrowType?: EscrowType
	goal?: number | null
	dbMilestones?: ReadonlyArray<ReleasableMilestone> | null
	dbReleasedAmount?: number | null
	preloadedEscrowData?: GetEscrowsFromIndexerResponse | null
}

export function useProjectReleasedDisplay({
	escrowContractAddress,
	goal,
	dbMilestones,
	dbReleasedAmount,
	preloadedEscrowData,
}: UseProjectReleasedDisplayParams) {
	const escrow = useOptionalEscrow()
	const getEscrowByContractIds = escrow?.getEscrowByContractIds
	const getEscrowByContractIdsRef = useRef(getEscrowByContractIds)
	getEscrowByContractIdsRef.current = getEscrowByContractIds

	const hasEscrow = projectHasEscrow({ escrowContractAddress })
	const address = escrowContractAddress ?? ''

	const { data: onChainReleasedAmount, isPending: isLoadingOnChain } = useQuery({
		queryKey: escrowReleasedQueryKey(address),
		queryFn: async () => {
			const getEscrow = getEscrowByContractIdsRef.current
			if (!address || !getEscrow) {
				return null
			}

			const response = await getEscrow({
				contractIds: [address],
				validateOnChain: true,
			})
			const escrowData = Array.isArray(response) ? response[0] : response
			return calculateReleasedAmountFromEscrow(escrowData)
		},
		enabled: hasEscrow && Boolean(getEscrowByContractIds) && !preloadedEscrowData,
		staleTime: ESCROW_QUERY_STALE_MS,
		refetchInterval: ESCROW_QUERY_POLL_MS,
		refetchOnWindowFocus: false,
		placeholderData: (previousData) => previousData,
	})

	const effectiveOnChainAmount = useMemo(() => {
		if (preloadedEscrowData) {
			return calculateReleasedAmountFromEscrow(preloadedEscrowData)
		}
		return onChainReleasedAmount ?? null
	}, [preloadedEscrowData, onChainReleasedAmount])

	const displayReleased = useMemo(
		() =>
			resolveDisplayReleasedAmount({
				dbMilestones,
				dbReleasedAmount,
				escrowContractAddress,
				onChainReleasedAmount: hasEscrow ? effectiveOnChainAmount : null,
				isLoadingOnChain: hasEscrow && isLoadingOnChain && effectiveOnChainAmount === null,
			}),
		[
			dbMilestones,
			dbReleasedAmount,
			escrowContractAddress,
			effectiveOnChainAmount,
			hasEscrow,
			isLoadingOnChain,
		],
	)

	const releasedProgressPercent = useMemo(
		() =>
			displayReleased === null ? null : calculateReleasedProgressPercent(displayReleased, goal),
		[displayReleased, goal],
	)

	return {
		displayReleased,
		releasedProgressPercent,
		isLoadingReleased: displayReleased === null && hasEscrow,
	}
}
