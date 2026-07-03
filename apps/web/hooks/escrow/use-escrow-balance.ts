'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOptionalEscrow } from '~/hooks/contexts/use-escrow.context'

interface UseEscrowBalanceParams {
	escrowContractAddress?: string
	escrowType?: EscrowType
}

export function useEscrowBalance({ escrowContractAddress, escrowType }: UseEscrowBalanceParams) {
	const escrow = useOptionalEscrow()
	const getMultipleBalances = escrow?.getMultipleBalances
	const [balance, setBalance] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<unknown>(null)

	const fetchBalance = useCallback(
		async (showLoading = true) => {
			if (!escrowContractAddress || !getMultipleBalances) return
			try {
				if (showLoading) setIsLoading(true)
				setError(null)
				const balances = await getMultipleBalances(
					{ addresses: [escrowContractAddress] },
					escrowType || 'multi-release',
				)
				const first = balances?.[0]
				if (first?.balance !== undefined && first.balance !== null) {
					const numericBalance = Number(first.balance)
					setBalance(Number.isFinite(numericBalance) ? numericBalance : null)
				}
			} catch (e) {
				setError(e)
			} finally {
				if (showLoading) setIsLoading(false)
			}
		},
		[escrowContractAddress, escrowType, getMultipleBalances],
	)

	useEffect(() => {
		if (!escrowContractAddress || !getMultipleBalances) {
			setBalance(null)
			setIsLoading(false)
			return
		}

		// Initial fetch with loading state
		fetchBalance(true)

		// Set up polling to refresh balance every 10 seconds (without loading state)
		const intervalId = setInterval(() => {
			fetchBalance(false)
		}, 10000) // Poll every 10 seconds

		return () => {
			clearInterval(intervalId)
		}
	}, [escrowContractAddress, fetchBalance, getMultipleBalances])

	const refetch = useCallback(() => {
		return fetchBalance(true)
	}, [fetchBalance])

	return useMemo(
		() => ({ balance, isLoading, error, refetch }),
		[balance, isLoading, error, refetch],
	)
}
