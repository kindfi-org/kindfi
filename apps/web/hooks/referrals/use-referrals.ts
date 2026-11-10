'use client'

import {
	type Query,
	type QueryClient,
	type UseQueryResult,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useLayoutEffect, useRef } from 'react'

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

export type SessionStatus = 'authenticated' | 'loading' | 'unauthenticated'

export type UseReferralsResult = Omit<UseQueryResult<ReferralsData>, 'data' | 'isLoading'> & {
	data: ReferralsData | undefined
	isLoading: boolean
	activateReferral: () => Promise<unknown>
	isActivating: boolean
	activateError: Error | null
	applyReferralCode: (code: string) => Promise<unknown>
	isApplying: boolean
	applyError: Error | null
}

export const REFERRALS_QUERY_KEY_PREFIX = ['referrals'] as const
export const UNAUTHENTICATED_REFERRALS_KEY = '__unauthenticated__' as const

/**
 * Resolves the canonical authenticated user ID from a NextAuth session.
 * Returns `null` whenever authentication is unresolved, signed out, or blank.
 */
export function resolveReferralSessionUserId(
	session: Session | null | undefined,
	status: SessionStatus,
): string | null {
	if (status !== 'authenticated') return null
	const rawId = session?.user?.id
	if (typeof rawId !== 'string') return null
	const trimmed = rawId.trim()
	return trimmed.length > 0 ? trimmed : null
}

/**
 * Builds the account-scoped TanStack Query key for referral data.
 */
export function buildReferralsQueryKey(userId: string | null): readonly ['referrals', string] {
	return ['referrals', userId ?? UNAUTHENTICATED_REFERRALS_KEY] as const
}

/**
 * Determines whether a cached query belongs to a superseded referral session.
 */
export function isObsoleteReferralQuery(
	query: Pick<Query, 'queryKey'>,
	activeUserId: string | null,
): boolean {
	if (!Array.isArray(query.queryKey) || query.queryKey[0] !== 'referrals') {
		return false
	}
	if (activeUserId === null) {
		return true
	}
	return query.queryKey.length !== 2 || query.queryKey[1] !== activeUserId
}

/**
 * Cancels and removes referral cache entries that do not belong to `activeUserId`.
 */
export function reconcileReferralQueryCache(
	queryClient: QueryClient,
	activeUserId: string | null,
): void {
	const predicate = (query: Query) => isObsoleteReferralQuery(query, activeUserId)
	void queryClient.cancelQueries({ predicate })
	queryClient.removeQueries({ predicate })
}

/**
 * Fetches the authenticated user's referral dashboard payload.
 */
const fetchReferrals = async (signal?: AbortSignal): Promise<ReferralsData> => {
	const response = await fetch('/api/referrals', signal ? { signal } : undefined)
	if (!response.ok) {
		throw new Error('Failed to fetch referrals')
	}
	return response.json()
}

/**
 * Subscribes to account-scoped referral data and exposes referral activation/application mutations.
 */
export const useReferrals = (): UseReferralsResult => {
	const queryClient = useQueryClient()
	const { data: session, status } = useSession()
	const authenticatedUserId = resolveReferralSessionUserId(session, status)
	const isAuthenticated = authenticatedUserId !== null
	const queryKey = buildReferralsQueryKey(authenticatedUserId)

	const activeUserIdRef = useRef<string | null>(authenticatedUserId)
	useLayoutEffect(() => {
		activeUserIdRef.current = authenticatedUserId
	}, [authenticatedUserId])

	useEffect(() => {
		if (status === 'loading' && authenticatedUserId === null) {
			return
		}
		reconcileReferralQueryCache(queryClient, authenticatedUserId)
	}, [queryClient, authenticatedUserId, status])

	const query = useQuery<ReferralsData>({
		queryKey,
		enabled: isAuthenticated,
		refetchInterval: isAuthenticated ? 30000 : false,
		queryFn: async ({ signal }) => {
			const requestUserId = authenticatedUserId
			if (!requestUserId) {
				throw new Error('Authentication required to fetch referrals')
			}
			const data = await fetchReferrals(signal)
			if (signal?.aborted || activeUserIdRef.current !== requestUserId) {
				reconcileReferralQueryCache(queryClient, activeUserIdRef.current)
				throw new DOMException('Referral request superseded by account transition', 'AbortError')
			}
			return data
		},
	})

	const activateMutation = useMutation<unknown, Error, void, { targetUserId: string | null }>({
		onMutate: () => ({ targetUserId: activeUserIdRef.current }),
		mutationFn: async () => {
			if (!activeUserIdRef.current) {
				throw new Error('Failed to activate referral code')
			}
			const response = await fetch('/api/referrals/activate', { method: 'POST' })
			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Failed to activate referral code')
			}
			return data
		},
		onSuccess: (_data, _variables, context) => {
			const targetUserId = context?.targetUserId ?? null
			if (targetUserId && activeUserIdRef.current === targetUserId) {
				void queryClient.invalidateQueries({
					queryKey: buildReferralsQueryKey(targetUserId),
					exact: true,
				})
			}
		},
	})

	const applyMutation = useMutation<unknown, Error, string, { targetUserId: string | null }>({
		onMutate: () => ({ targetUserId: activeUserIdRef.current }),
		mutationFn: async (code: string) => {
			if (!activeUserIdRef.current) {
				throw new Error('Failed to apply referral code')
			}
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
		onSuccess: (_data, _variables, context) => {
			const targetUserId = context?.targetUserId ?? null
			if (targetUserId && activeUserIdRef.current === targetUserId) {
				void queryClient.invalidateQueries({
					queryKey: buildReferralsQueryKey(targetUserId),
					exact: true,
				})
			}
		},
	})

	return {
		...query,
		data: isAuthenticated ? query.data : undefined,
		isLoading: status === 'loading' || (isAuthenticated && query.isLoading),
		activateReferral: activateMutation.mutateAsync,
		isActivating: activateMutation.isPending,
		activateError: activateMutation.error,
		applyReferralCode: applyMutation.mutateAsync,
		isApplying: applyMutation.isPending,
		applyError: applyMutation.error,
	}
}
