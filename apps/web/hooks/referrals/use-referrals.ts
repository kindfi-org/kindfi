'use client'

import type { QueryClient } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

export interface Referral {
	id: string
	referrer_id: string
	referred_id: string
	status: 'pending' | 'onboarded' | 'first_donation' | 'active'
	created_at: string
	onboarded_at: string | null
	first_donation_at: string | null
	total_donations: number
}

export interface ReferrerStats {
	total_referrals: number
	active_referrals: number
	total_reward_points: number
}

export interface ReferralProfile {
	user_id: string
	referral_code: string
	stellar_address: string | null
	activated_at: string
	on_chain_ready: boolean
}

export interface ReferralsData {
	referrals: Referral[]
	statistics: ReferrerStats
	referred_by: string | null
	is_activated: boolean
	referral_code: string | null
	referral_profile: ReferralProfile | null
}

/**
 * Prefix for every referral cache entry. `referralsQueryKey` extends this
 * with the account id so `invalidateQueries({ queryKey: REFERRALS_PREFIX })`
 * still touches every per-user entry when a caller wants to.
 */
export const REFERRALS_QUERY_PREFIX = ['referrals'] as const

/**
 * The referral endpoint is account-scoped, so the cache key must be too.
 * `null` is used for the signed-out slot so it never collides with a real
 * user id. Caller never fetches on the signed-out slot (see `enabled` in
 * {@link useReferrals}); the key is still well-defined so a leftover slot
 * is easy to clear with `cleanReferralsForAccountTransition`.
 */
export function referralsQueryKey(userId: string | null | undefined) {
	return [...REFERRALS_QUERY_PREFIX, userId ?? null] as const
}

/**
 * When the signed-in account changes, drop the previous account's cached
 * referral data: cancel any in-flight request so a late response cannot
 * populate the next account's entry, and remove the stale entry so it is
 * not available for a keyed read. Exported as a plain function so an
 * account-transition regression test runs without a React tree.
 */
export function cleanReferralsForAccountTransition(
	queryClient: QueryClient,
	previousUserId: string | null | undefined,
	nextUserId: string | null | undefined,
): void {
	if (previousUserId == null) return
	if (previousUserId === nextUserId) return
	const key = referralsQueryKey(previousUserId)
	queryClient.cancelQueries({ queryKey: key })
	queryClient.removeQueries({ queryKey: key, exact: true })
}

const fetchReferrals = async (): Promise<ReferralsData> => {
	const response = await fetch('/api/referrals')
	if (!response.ok) {
		throw new Error('Failed to fetch referrals')
	}
	return response.json()
}

export const useReferrals = () => {
	const queryClient = useQueryClient()
	const { data: session, status } = useSession()
	const userId = session?.user?.id ?? null

	// Only the authenticated account polls; a `loading` or `unauthenticated`
	// session never hits `/api/referrals`.
	const enabled = status === 'authenticated' && userId != null

	const queryKey = referralsQueryKey(userId)

	// Drop the previous account's cached referral data on every transition
	// so a cached entry from account A can never serve account B, and a
	// late A response cannot populate B's entry. Keyed-by-userId already
	// prevents the display leak; this is the memory-hygiene half.
	const previousUserIdRef = useRef<string | null | undefined>(userId)
	useEffect(() => {
		cleanReferralsForAccountTransition(queryClient, previousUserIdRef.current, userId)
		previousUserIdRef.current = userId
	}, [queryClient, userId])

	const query = useQuery<ReferralsData>({
		queryKey,
		queryFn: fetchReferrals,
		refetchInterval: 30000,
		enabled,
	})

	const activateMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch('/api/referrals/activate', { method: 'POST' })
			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Failed to activate referral code')
			}
			return data
		},
		onSuccess: () => {
			// Only invalidate the current account's entry, so activating
			// for the active user never refetches a stale entry for a
			// previously signed-in account.
			queryClient.invalidateQueries({ queryKey })
		},
	})

	const applyMutation = useMutation({
		mutationFn: async (code: string) => {
			const response = await fetch('/api/referrals/apply', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code }),
			})
			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Failed to apply referral code')
			}
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey })
		},
	})

	return {
		...query,
		activateReferral: activateMutation.mutateAsync,
		isActivating: activateMutation.isPending,
		activateError: activateMutation.error,
		applyReferralCode: applyMutation.mutateAsync,
		isApplying: applyMutation.isPending,
		applyError: applyMutation.error,
	}
}
