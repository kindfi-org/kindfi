/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query'
import type { Session } from 'next-auth'
import { renderToStaticMarkup } from 'react-dom/server'
import {
	buildReferralsQueryKey,
	type ReferralsData,
	reconcileReferralQueryCache,
	resolveReferralSessionUserId,
	type SessionStatus,
	UNAUTHENTICATED_REFERRALS_KEY,
} from '~/hooks/referrals/use-referrals'

function makeReferralsData(userId: string, referralCode: string): ReferralsData {
	return {
		referrals: [],
		statistics: {
			total_referrals: userId === 'user-a' ? 4 : 1,
			active_referrals: userId === 'user-a' ? 2 : 1,
			total_reward_points: userId === 'user-a' ? 200 : 50,
		},
		referred_by: null,
		is_activated: true,
		referral_code: referralCode,
		referral_profile: {
			user_id: userId,
			referral_code: referralCode,
			stellar_address: null,
			activated_at: '2026-01-01T00:00:00.000Z',
			on_chain_ready: true,
		},
	}
}

function makeSession(userId?: string): Session {
	return {
		expires: '2099-01-01T00:00:00.000Z',
		user: userId ? ({ id: userId, email: `${userId}@example.com` } as Session['user']) : undefined,
	}
}

describe('resolveReferralSessionUserId & buildReferralsQueryKey', () => {
	test('resolves user ID only when session status is authenticated and id is non-empty', () => {
		expect(resolveReferralSessionUserId(makeSession('user-a'), 'authenticated')).toBe('user-a')
		expect(resolveReferralSessionUserId(makeSession('  user-b  '), 'authenticated')).toBe('user-b')
		expect(resolveReferralSessionUserId(makeSession('user-a'), 'loading')).toBeNull()
		expect(resolveReferralSessionUserId(makeSession('user-a'), 'unauthenticated')).toBeNull()
		expect(resolveReferralSessionUserId(makeSession('   '), 'authenticated')).toBeNull()
		expect(resolveReferralSessionUserId(null, 'authenticated')).toBeNull()
	})

	test('scopes referral query keys by authenticated user ID', () => {
		expect(buildReferralsQueryKey('user-a')).toEqual(['referrals', 'user-a'])
		expect(buildReferralsQueryKey('user-b')).toEqual(['referrals', 'user-b'])
		expect(buildReferralsQueryKey(null)).toEqual(['referrals', UNAUTHENTICATED_REFERRALS_KEY])
	})
})

describe('useReferrals authentication gating and account transition behavior', () => {
	let currentSession: { data: Session | null; status: SessionStatus }
	let queryClient: QueryClient
	let originalFetch: typeof globalThis.fetch

	mock.module('next-auth/react', () => ({
		useSession: () => currentSession,
	}))

	beforeEach(() => {
		currentSession = { data: null, status: 'unauthenticated' }
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		})
		originalFetch = globalThis.fetch
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
		queryClient.clear()
	})

	test('signed-out and unresolved sessions do not poll or fetch the referral endpoint', async () => {
		let fetchCalls = 0
		globalThis.fetch = mock(async () => {
			fetchCalls += 1
			return new Response(JSON.stringify(makeReferralsData('user-a', 'CODE-A')), { status: 200 })
		}) as unknown as typeof fetch

		const { useReferrals } = await import('~/hooks/referrals/use-referrals')
		let latestHookValue: ReturnType<typeof useReferrals> | null = null

		function Probe() {
			latestHookValue = useReferrals()
			return null
		}

		// 1. Unresolved (loading) session
		currentSession = { data: null, status: 'loading' }
		renderToStaticMarkup(
			<QueryClientProvider client={queryClient}>
				<Probe />
			</QueryClientProvider>,
		)
		expect(fetchCalls).toBe(0)
		expect(latestHookValue?.data).toBeUndefined()
		expect(latestHookValue?.isLoading).toBe(true)

		// 2. Signed-out (unauthenticated) session
		currentSession = { data: null, status: 'unauthenticated' }
		renderToStaticMarkup(
			<QueryClientProvider client={queryClient}>
				<Probe />
			</QueryClientProvider>,
		)
		expect(fetchCalls).toBe(0)
		expect(latestHookValue?.data).toBeUndefined()
		expect(latestHookValue?.isLoading).toBe(false)

		// 3. Authenticated status without a resolved user ID
		currentSession = { data: makeSession(''), status: 'authenticated' }
		renderToStaticMarkup(
			<QueryClientProvider client={queryClient}>
				<Probe />
			</QueryClientProvider>,
		)
		expect(fetchCalls).toBe(0)
		expect(latestHookValue?.data).toBeUndefined()
	})

	test('switching A -> signed out -> B never displays A cached referral data for B', async () => {
		const dataA = makeReferralsData('user-a', 'REF-ALICE')
		const dataB = makeReferralsData('user-b', 'REF-BOB')

		// Populate account A cache entry in the shared QueryClient (which sits above SessionProvider)
		queryClient.setQueryData(buildReferralsQueryKey('user-a'), dataA)
		// Also simulate a legacy global ['referrals'] entry
		queryClient.setQueryData(['referrals'], dataA)

		const { useReferrals } = await import('~/hooks/referrals/use-referrals')
		let latestHookValue: ReturnType<typeof useReferrals> | null = null

		function Probe() {
			latestHookValue = useReferrals()
			return null
		}

		// Step 1: Account A renders its own cached referral data
		currentSession = { data: makeSession('user-a'), status: 'authenticated' }
		renderToStaticMarkup(
			<QueryClientProvider client={queryClient}>
				<Probe />
			</QueryClientProvider>,
		)
		expect(latestHookValue?.data?.referral_code).toBe('REF-ALICE')

		// Step 2: Transition A -> signed out
		currentSession = { data: null, status: 'unauthenticated' }
		reconcileReferralQueryCache(queryClient, null)
		renderToStaticMarkup(
			<QueryClientProvider client={queryClient}>
				<Probe />
			</QueryClientProvider>,
		)
		expect(latestHookValue?.data).toBeUndefined()
		expect(queryClient.getQueryData(buildReferralsQueryKey('user-a'))).toBeUndefined()
		expect(queryClient.getQueryData(['referrals'])).toBeUndefined()

		// Step 3: Even if A's entry was still in cache before B mounts, transitioning to B never shows A's data
		queryClient.setQueryData(buildReferralsQueryKey('user-a'), dataA)
		currentSession = { data: makeSession('user-b'), status: 'authenticated' }
		reconcileReferralQueryCache(queryClient, 'user-b')
		renderToStaticMarkup(
			<QueryClientProvider client={queryClient}>
				<Probe />
			</QueryClientProvider>,
		)
		expect(latestHookValue?.data).toBeUndefined()
		expect(queryClient.getQueryData(buildReferralsQueryKey('user-a'))).toBeUndefined()

		// Step 4: When B's query resolves, B sees only B's referral data
		queryClient.setQueryData(buildReferralsQueryKey('user-b'), dataB)
		renderToStaticMarkup(
			<QueryClientProvider client={queryClient}>
				<Probe />
			</QueryClientProvider>,
		)
		expect(latestHookValue?.data?.referral_code).toBe('REF-BOB')
		expect(latestHookValue?.data?.referral_profile?.user_id).toBe('user-b')
	})

	test('late A responses cannot populate B entry and mutations refresh only the intended account', async () => {
		const dataA = makeReferralsData('user-a', 'REF-ALICE')
		const dataB = makeReferralsData('user-b', 'REF-BOB')

		let resolveSlowA!: (value: ReferralsData) => void
		const slowAPromise = new Promise<ReferralsData>((resolve) => {
			resolveSlowA = resolve
		})

		let activePrincipal: string | null = 'user-a'

		// Start in-flight query for User A
		const fetchA = queryClient.fetchQuery({
			queryKey: buildReferralsQueryKey('user-a'),
			queryFn: async ({ signal }) => {
				const result = await slowAPromise
				if (signal?.aborted || activePrincipal !== 'user-a') {
					reconcileReferralQueryCache(queryClient, activePrincipal)
					throw new DOMException('Superseded', 'AbortError')
				}
				return result
			},
		})

		// Switch active account to User B before A finishes
		activePrincipal = 'user-b'
		reconcileReferralQueryCache(queryClient, 'user-b')
		queryClient.setQueryData(buildReferralsQueryKey('user-b'), dataB)

		// Now let A's late response resolve
		resolveSlowA(dataA)
		await expect(fetchA).rejects.toThrow()

		// Verify B's cache entry is intact and A's cache entry was never populated
		expect(
			queryClient.getQueryData<ReferralsData>(buildReferralsQueryKey('user-b'))?.referral_code,
		).toBe('REF-BOB')
		expect(queryClient.getQueryData(buildReferralsQueryKey('user-a'))).toBeUndefined()

		// Verify scoped mutation invalidation refreshes only the intended account
		let refetchedA = 0
		let refetchedB = 0
		queryClient.setQueryData(buildReferralsQueryKey('user-a'), dataA)
		queryClient.setQueryData(buildReferralsQueryKey('user-b'), dataB)

		const observerA = new QueryObserver(queryClient, {
			queryKey: buildReferralsQueryKey('user-a'),
			queryFn: async () => {
				refetchedA += 1
				return dataA
			},
			staleTime: 60_000,
		})
		const observerB = new QueryObserver(queryClient, {
			queryKey: buildReferralsQueryKey('user-b'),
			queryFn: async () => {
				refetchedB += 1
				return dataB
			},
			staleTime: 60_000,
		})
		const unsubA = observerA.subscribe(() => {})
		const unsubB = observerB.subscribe(() => {})

		await queryClient.invalidateQueries({
			queryKey: buildReferralsQueryKey('user-b'),
			exact: true,
		})

		unsubA()
		unsubB()

		expect(refetchedB).toBe(1)
		expect(refetchedA).toBe(0)
	})
})
