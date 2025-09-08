'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import type { EscrowType } from '@trustless-work/escrow'

interface UseEscrowBalanceParams {
  escrowContractAddress?: string
  escrowType?: EscrowType
  signer?: string
}

export function useEscrowBalance({ escrowContractAddress, escrowType, signer }: UseEscrowBalanceParams) {
  const { getMultipleBalances } = useEscrow()
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const fetchBalance = useCallback(async () => {
    if (!escrowContractAddress) return
    try {
      setIsLoading(true)
      setError(null)
      const balances = await getMultipleBalances(
        {
          signer:
            signer || 'GCRYH6M5YLTGZTCAALJPIJGQZY4Z6XFFUVTINCELQG4OGLADUBTAE3OU',
          addresses: [escrowContractAddress],
        },
        escrowType || 'multi-release',
      )
      const first = balances?.[0]
      if (first) setBalance(first.balance)
    } catch (e) {
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }, [escrowContractAddress, escrowType, getMultipleBalances, signer])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return useMemo(
    () => ({ balance, isLoading, error, refetch: fetchBalance }),
    [balance, isLoading, error, fetchBalance],
  )
}


