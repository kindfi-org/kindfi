'use client'

import { useCallback, useEffect, useState } from 'react'
import type { EtherfuseOnboardingStatus } from '~/lib/etherfuse/resolve-order-context'
import {
	safeLocalStorageGet,
	safeLocalStorageRemove,
	safeLocalStorageSet,
} from '~/lib/utils/safe-storage'

export type EtherfuseUserOnboarding = {
	customerId: string
	bankAccountId: string
	walletPublicKey: string
}

export type { EtherfuseOnboardingStatus }

const storageKey = (userId: string) => `kindfi:etherfuse:${userId}`

const readStoredOnboarding = (
	userId: string,
	walletAddress: string | null,
): EtherfuseUserOnboarding | null => {
	if (typeof window === 'undefined' || !walletAddress) {
		return null
	}

	try {
		const raw = safeLocalStorageGet(storageKey(userId))
		if (!raw) {
			return null
		}

		const parsed = JSON.parse(raw) as EtherfuseUserOnboarding
		if (parsed.walletPublicKey !== walletAddress) {
			safeLocalStorageRemove(storageKey(userId))
			return null
		}

		return parsed
	} catch {
		safeLocalStorageRemove(storageKey(userId))
		return null
	}
}

export const useEtherfuseUserOnboarding = (userId: string, walletAddress: string | null) => {
	const [onboarding, setOnboarding] = useState<EtherfuseUserOnboarding | null>(null)
	const [status, setStatus] = useState<EtherfuseOnboardingStatus | null>(null)
	const [isStarting, setIsStarting] = useState(false)
	const [isCheckingStatus, setIsCheckingStatus] = useState(false)

	useEffect(() => {
		setOnboarding(readStoredOnboarding(userId, walletAddress))
	}, [userId, walletAddress])

	const persistOnboarding = useCallback(
		(record: EtherfuseUserOnboarding) => {
			safeLocalStorageSet(storageKey(userId), JSON.stringify(record))
			setOnboarding(record)
		},
		[userId],
	)

	const clearOnboarding = useCallback(() => {
		safeLocalStorageRemove(storageKey(userId))
		setOnboarding(null)
		setStatus(null)
	}, [userId])

	const refreshStatus = useCallback(async () => {
		if (!walletAddress) {
			setStatus(null)
			return null
		}

		setIsCheckingStatus(true)

		try {
			const params = new URLSearchParams({ walletAddress })
			const response = await fetch(`/api/etherfuse/onboarding-status?${params.toString()}`)
			const data = await response.json()

			if (!response.ok) {
				setStatus(null)
				return null
			}

			const nextStatus = data as EtherfuseOnboardingStatus
			setStatus(nextStatus)
			return nextStatus
		} finally {
			setIsCheckingStatus(false)
		}
	}, [walletAddress])

	useEffect(() => {
		void refreshStatus()
	}, [refreshStatus])

	useEffect(() => {
		if (!onboarding?.customerId) {
			return
		}

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				void refreshStatus()
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
	}, [onboarding?.customerId, refreshStatus])

	const startOnboarding = useCallback(async () => {
		if (!walletAddress) {
			throw new Error('Connect an external wallet before starting Etherfuse onboarding.')
		}

		setIsStarting(true)

		try {
			const response = await fetch('/api/etherfuse/onboarding-url', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					walletAddress,
					customerId: onboarding?.customerId,
					bankAccountId: onboarding?.bankAccountId,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				if (response.status === 409) {
					clearOnboarding()
				}
				throw new Error(data.error ?? 'Failed to start Etherfuse onboarding')
			}

			persistOnboarding({
				customerId: data.customerId,
				bankAccountId: data.bankAccountId,
				walletPublicKey: walletAddress,
			})

			if (data.presignedUrl) {
				window.open(data.presignedUrl, '_blank', 'noopener,noreferrer')
			}

			return data.presignedUrl as string | undefined
		} finally {
			setIsStarting(false)
		}
	}, [
		clearOnboarding,
		onboarding?.bankAccountId,
		onboarding?.customerId,
		persistOnboarding,
		walletAddress,
	])

	return {
		onboarding,
		status,
		isStarting,
		isCheckingStatus,
		startOnboarding,
		clearOnboarding,
		refreshStatus,
		hasStartedOnboarding: Boolean(onboarding?.customerId && onboarding.bankAccountId),
		isReady: Boolean(status?.isReady),
	}
}
