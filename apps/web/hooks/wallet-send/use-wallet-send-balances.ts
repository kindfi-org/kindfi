'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getWalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import { loadHorizonAccount, WalletSendHorizonError } from '~/lib/wallet-send/horizon/accounts'
import { getWalletBalances } from '~/lib/wallet-send/horizon/balances'
import { createHorizonServer } from '~/lib/wallet-send/horizon/client'
import type { WalletSendAssetCode } from '~/lib/wallet-send/types'

export const useWalletSendBalances = (walletAddress: string | null) => {
	const [balances, setBalances] = useState<Record<
		WalletSendAssetCode,
		{ available: string; total: string }
	> | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const configResult = useMemo(() => getWalletTransferConfig(), [])

	const refresh = useCallback(async () => {
		if (!walletAddress || !configResult.ok) {
			setBalances(null)
			setError(configResult.ok ? null : configResult.error)
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const server = createHorizonServer(configResult.config)
			const account = await loadHorizonAccount(server, walletAddress)
			setBalances(getWalletBalances(account, configResult.config))
		} catch (loadError) {
			const message =
				loadError instanceof WalletSendHorizonError
					? loadError.message
					: 'Unable to load wallet balances.'
			setError(message)
			setBalances(null)
		} finally {
			setIsLoading(false)
		}
	}, [configResult, walletAddress])

	useEffect(() => {
		void refresh()
	}, [refresh])

	return {
		balances,
		isLoading,
		error,
		config: configResult.ok ? configResult.config : null,
		configError: configResult.ok ? null : configResult.error,
		refresh,
	}
}
