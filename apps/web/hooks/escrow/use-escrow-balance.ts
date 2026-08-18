'use client'

import { useQuery } from '@tanstack/react-query'
import type { EscrowType } from '@trustless-work/escrow'
import { useRef } from 'react'
import { useOptionalEscrow } from '~/hooks/contexts/use-escrow.context'
import {
	ESCROW_QUERY_POLL_MS,
	ESCROW_QUERY_STALE_MS,
	escrowBalanceQueryKey,
} from '~/lib/constants/escrow-query.constants'

interface UseEscrowBalanceParams {
	escrowContractAddress?: string
	escrowType?: EscrowType
}

export function useEscrowBalance({ escrowContractAddress, escrowType }: UseEscrowBalanceParams) {
	const escrow = useOptionalEscrow()
	const getMultipleBalances = escrow?.getMultipleBalances
	const getMultipleBalancesRef = useRef(getMultipleBalances)
	getMultipleBalancesRef.current = getMultipleBalances

	const effectiveType: EscrowType = escrowType ?? 'multi-release'

	const {
		data: balance = null,
		isPending,
		error,
		refetch,
	} = useQuery({
		queryKey: escrowBalanceQueryKey(escrowContractAddress ?? '', effectiveType),
		queryFn: async () => {
			const getBalances = getMultipleBalancesRef.current
			if (!escrowContractAddress || !getBalances) {
				return null
			}

			const balances = await getBalances({ addresses: [escrowContractAddress] }, effectiveType)
			const first = balances?.[0]
			if (first?.balance !== undefined && first.balance !== null) {
				const numericBalance = Number(first.balance)
				if (Number.isFinite(numericBalance)) {
					return numericBalance
				}
			}

			const response = await fetch(
				`/api/escrow/balance?contractId=${encodeURIComponent(escrowContractAddress)}`,
				{ cache: 'no-store' },
			)

			if (response.ok) {
				const payload = (await response.json()) as { balance?: number | null }
				if (typeof payload.balance === 'number' && Number.isFinite(payload.balance)) {
					return payload.balance
				}
			}

			return null
		},
		enabled: Boolean(escrowContractAddress) && Boolean(getMultipleBalances),
		staleTime: ESCROW_QUERY_STALE_MS,
		refetchInterval: ESCROW_QUERY_POLL_MS,
		refetchOnWindowFocus: false,
		placeholderData: (previousData) => previousData,
	})

	return {
		balance,
		isLoading: isPending,
		error,
		refetch: () => refetch(),
	}
}
