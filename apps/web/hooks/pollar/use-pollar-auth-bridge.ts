'use client'

import type { PollarClient } from '@pollar/core'
import { usePollar } from '@pollar/react'
import { signIn, useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createSessionAction } from '~/app/actions/auth'
import { useI18n } from '~/lib/i18n'
import { trackOnboardingPath } from '~/lib/pollar/analytics'
import { clearPollarSession } from '~/lib/pollar/clear-pollar-session'
import { collectPollarClientSessionProof } from '~/lib/pollar/collect-client-session'
import {
	getBridgedPollarUserId,
	setBridgedPollarUserId,
} from '~/lib/pollar/reset-pollar-auth-bridge-state'

/**
 * Pollar's LoginModal auto-closes when auth state is `authenticated` (replayed on
 * subscribe). Always clear any existing session before showing login UI.
 */
const preparePollarInteractiveLogin = async (client: PollarClient): Promise<void> => {
	await clearPollarSession()
	await client.ready()
}

export const usePollarAuthBridge = () => {
	const { t } = useI18n()
	const { data: session } = useSession()
	const { isAuthenticated, verified, login, getClient, openLoginModal, configStatus } = usePollar()
	const [isBridging, setIsBridging] = useState(false)
	const loginStartedRef = useRef(false)
	const bridgeInFlightRef = useRef(false)

	const bridgeToKindFiSession = useCallback(
		async (options?: { linkToExistingUserId?: string }) => {
			if (bridgeInFlightRef.current) {
				return
			}

			bridgeInFlightRef.current = true
			setIsBridging(true)
			try {
				const client = getClient()
				await client.ready()
				const sessionProof = collectPollarClientSessionProof(client)

				if (
					getBridgedPollarUserId() === sessionProof.pollarUserId &&
					session?.user?.id &&
					!options?.linkToExistingUserId
				) {
					return
				}

				const callbackRes = await fetch('/api/auth/pollar/callback', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...sessionProof,
						linkToExistingUserId: options?.linkToExistingUserId,
					}),
				})

				if (!callbackRes.ok) {
					const err = await callbackRes.json()
					throw new Error(err.error ?? 'Failed to link Pollar account')
				}

				const { userId, email } = await callbackRes.json()

				const sessionResult = await createSessionAction({ userId, email })
				if (!sessionResult.success) {
					throw new Error(sessionResult.message)
				}

				const signInResult = await signIn('pollar', {
					redirect: false,
					pollarSessionJson: JSON.stringify(sessionProof),
					linkToExistingUserId: options?.linkToExistingUserId ?? '',
				})

				if (signInResult?.error) {
					throw new Error(signInResult.error)
				}

				setBridgedPollarUserId(sessionProof.pollarUserId)
				loginStartedRef.current = false

				toast.success(t('auth.pollarBridgeSuccess'))
				trackOnboardingPath('pollar', 'signup_completed')
				window.location.href = sessionResult.redirect || '/profile'
			} catch (error) {
				toast.error(t('auth.pollarBridgeError'), {
					description: error instanceof Error ? error.message : undefined,
				})
				throw error
			} finally {
				bridgeInFlightRef.current = false
				setIsBridging(false)
			}
		},
		[getClient, session?.user?.id, t],
	)

	const tryAutoBridge = useCallback(
		(linkToExistingUserId?: string) => {
			const client = getClient()
			const authState = client.getAuthState()
			if (authState.step !== 'authenticated' || !authState.verified) {
				return
			}

			const pollarUserId = authState.session?.userId ?? authState.session?.user?.id ?? null
			if (!pollarUserId) {
				return
			}

			const shouldBridge =
				loginStartedRef.current || Boolean(linkToExistingUserId) || Boolean(session?.user?.id)

			if (!shouldBridge) {
				return
			}

			if (getBridgedPollarUserId() === pollarUserId && session?.user?.id && !linkToExistingUserId) {
				return
			}

			if (
				session?.user?.onboardingProvider === 'pollar' &&
				session.user.id &&
				!linkToExistingUserId
			) {
				setBridgedPollarUserId(pollarUserId)
				loginStartedRef.current = false
				return
			}

			void bridgeToKindFiSession(linkToExistingUserId ? { linkToExistingUserId } : undefined).catch(
				() => {
					// Errors are surfaced via toast in bridgeToKindFiSession.
				},
			)
		},
		[bridgeToKindFiSession, getClient, session?.user?.id, session?.user?.onboardingProvider],
	)

	// Bridge once the SDK confirms the session server-side (`verified`).
	useEffect(() => {
		if (configStatus !== 'ready') {
			return
		}

		const client = getClient()
		let cancelled = false

		const handleAuthState = () => {
			if (cancelled) {
				return
			}
			tryAutoBridge(session?.user?.id)
		}

		const unsubscribe = client.onAuthStateChange((state) => {
			if (state.step === 'authenticated' && state.verified) {
				handleAuthState()
			}
		})

		void client.ready().then(() => {
			if (!cancelled) {
				handleAuthState()
			}
		})

		return () => {
			cancelled = true
			unsubscribe()
		}
	}, [configStatus, getClient, session?.user?.id, tryAutoBridge])

	const loginWithPollar = useCallback(
		async (provider: 'google' | 'github' | 'email', email?: string) => {
			if (configStatus === 'error') {
				toast.error(t('auth.pollarBridgeError'), {
					description: 'Pollar configuration could not be loaded. Please try again.',
				})
				return
			}

			const client = getClient()

			loginStartedRef.current = true
			trackOnboardingPath('pollar', 'signup_started')

			await preparePollarInteractiveLogin(client)

			if (provider === 'email' && !email) {
				openLoginModal()
				return
			}

			if (provider === 'email' && email) {
				login({ provider: 'email', email })
				return
			}

			if (provider === 'google' || provider === 'github') {
				login({ provider })
				return
			}

			openLoginModal()
		},
		[configStatus, getClient, login, openLoginModal, t],
	)

	const linkPollarToCurrentAccount = useCallback(async () => {
		if (!session?.user?.id) {
			throw new Error('Sign in to link your Pollar wallet')
		}
		loginStartedRef.current = true
		await bridgeToKindFiSession({ linkToExistingUserId: session.user.id })
	}, [bridgeToKindFiSession, session?.user?.id])

	const shouldAutoBridge =
		isAuthenticated && verified && (loginStartedRef.current || Boolean(session?.user?.id))

	return {
		isPollarAuthenticated: shouldAutoBridge,
		isBridging,
		configStatus,
		bridgeToKindFiSession,
		loginWithPollar,
		linkPollarToCurrentAccount,
		openLoginModal,
		getClient,
	}
}
