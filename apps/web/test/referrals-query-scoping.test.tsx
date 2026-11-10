/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Session } from 'next-auth'
import {
	act,
	createContext,
	type ReactNode,
	Suspense,
	startTransition,
	useContext,
	useLayoutEffect,
	useState,
} from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
	buildReferralsQueryKey,
	isObsoleteReferralQuery,
	type ReferralsData,
	resolveReferralSessionUserId,
	type SessionStatus,
	UNAUTHENTICATED_REFERRALS_KEY,
	type UseReferralsResult,
} from '~/hooks/referrals/use-referrals'

/**
 * Installs a minimal client host environment so `react-dom/client` (`createRoot` + `act`)
 * executes `useLayoutEffect`, `useEffect`, and TanStack Query `QueryObserver` subscriptions
 * without requiring an external DOM dependency.
 */
function setupMinimalClientEnvironment(): { container: Element; restore: () => void } {
	const prevActEnv = (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT
	const prevWindow = (globalThis as Record<string, unknown>).window
	const prevDocument = (globalThis as Record<string, unknown>).document

	const noop = (): void => {}
	const doc: Record<string, unknown> = {
		visibilityState: 'visible',
		activeElement: null,
		body: null,
		addEventListener: noop,
		removeEventListener: noop,
	}
	const win: Record<string, unknown> = {
		event: undefined,
		document: doc,
		HTMLIFrameElement: class {},
		addEventListener: noop,
		removeEventListener: noop,
	}
	doc.defaultView = win

	;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
	;(globalThis as Record<string, unknown>).window = win
	;(globalThis as Record<string, unknown>).document = doc

	const container = {
		nodeType: 1,
		nodeName: 'DIV',
		tagName: 'DIV',
		namespaceURI: 'http://www.w3.org/1999/xhtml',
		ownerDocument: doc,
		addEventListener: noop,
		removeEventListener: noop,
	} as unknown as Element

	return {
		container,
		restore: (): void => {
			;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = prevActEnv
			if (prevWindow === undefined) {
				delete (globalThis as Record<string, unknown>).window
			} else {
				;(globalThis as Record<string, unknown>).window = prevWindow
			}
			if (prevDocument === undefined) {
				delete (globalThis as Record<string, unknown>).document
			} else {
				;(globalThis as Record<string, unknown>).document = prevDocument
			}
		},
	}
}

/**
 * Creates a deterministic `ReferralsData` fixture for a given test user.
 */
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

/**
 * Builds a pure microtask JSON `Response` stub that avoids native body-stream thread-pool races.
 */
function jsonResponse(payload: unknown, status = 200): Response {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => payload,
	} as unknown as Response
}

/**
 * Builds a mock NextAuth `Session` object for testing account transitions.
 */
function makeSession(userId?: string): Session {
	if (userId === undefined) {
		return { expires: '2099-01-01T00:00:00.000Z' } as unknown as Session
	}
	return {
		expires: '2099-01-01T00:00:00.000Z',
		user: { id: userId, email: `${userId}@example.com` } as Session['user'],
	}
}

describe('resolveReferralSessionUserId, buildReferralsQueryKey & isObsoleteReferralQuery', () => {
	test('resolves user ID only when session status is authenticated and id is non-empty', () => {
		expect(resolveReferralSessionUserId(makeSession('user-a'), 'authenticated')).toBe('user-a')
		expect(resolveReferralSessionUserId(makeSession('  user-b  '), 'authenticated')).toBe('user-b')
		expect(resolveReferralSessionUserId(makeSession('user-a'), 'loading')).toBeNull()
		expect(resolveReferralSessionUserId(makeSession('user-a'), 'unauthenticated')).toBeNull()
		expect(resolveReferralSessionUserId(makeSession('   '), 'authenticated')).toBeNull()
		expect(resolveReferralSessionUserId(null, 'authenticated')).toBeNull()
	})

	test('scopes referral query keys by authenticated user ID and flags obsolete referral keys', () => {
		expect(buildReferralsQueryKey('user-a')).toEqual(['referrals', 'user-a'])
		expect(buildReferralsQueryKey('user-b')).toEqual(['referrals', 'user-b'])
		expect(buildReferralsQueryKey(null)).toEqual(['referrals', UNAUTHENTICATED_REFERRALS_KEY])

		expect(isObsoleteReferralQuery({ queryKey: ['referrals', 'user-a'] }, 'user-a')).toBe(false)
		expect(isObsoleteReferralQuery({ queryKey: ['referrals', 'user-a'] }, 'user-b')).toBe(true)
		expect(isObsoleteReferralQuery({ queryKey: ['referrals'] }, 'user-a')).toBe(true)
		expect(isObsoleteReferralQuery({ queryKey: ['notifications', 'user-a'] }, null)).toBe(false)
	})
})

describe('useReferrals client-mounted gating, transitions, and mutations', () => {
	let currentSession: { data: Session | null; status: SessionStatus }
	let queryClient: QueryClient
	let originalFetch: typeof globalThis.fetch
	let clientEnv: { container: Element; restore: () => void }
	let root: Root | null

	const SessionOverrideContext = createContext<{
		data: Session | null
		status: SessionStatus
	} | null>(null)

	mock.module('next-auth/react', () => ({
		useSession: () => useContext(SessionOverrideContext) ?? currentSession,
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
		clientEnv = setupMinimalClientEnvironment()
		root = createRoot(clientEnv.container)
	})

	afterEach(async () => {
		if (root) {
			await act(async () => {
				root?.unmount()
			})
			root = null
		}
		globalThis.fetch = originalFetch
		queryClient.clear()
		clientEnv.restore()
	})

	/**
	 * Executes an optional state-triggering `action` inside `act` and flushes TanStack Query's
	 * `notifyManager` macrotask + microtask queue before exiting `act`.
	 */
	async function flushAsyncAct(action?: () => void): Promise<void> {
		await act(async () => {
			action?.()
			await new Promise<void>((resolve) => {
				setTimeout(resolve, 10)
			})
		})
	}

	/**
	 * Renders `node` inside `QueryClientProvider` on the active client `Root`.
	 */
	async function renderClient(node: ReactNode): Promise<void> {
		await act(async () => {
			root?.render(<QueryClientProvider client={queryClient}>{node}</QueryClientProvider>)
		})
	}

	test('unauthenticated and unresolved client sessions stay pending without errors or fetches, while authenticated sessions fetch and configure polling', async () => {
		let fetchCalls = 0

		globalThis.fetch = mock(async () => {
			fetchCalls += 1
			return jsonResponse(makeReferralsData('user-a', 'CODE-A'))
		}) as unknown as typeof fetch

		const { useReferrals } = await import('~/hooks/referrals/use-referrals')
		const hookRef: { current: UseReferralsResult | null } = { current: null }

		function Probe(): null {
			hookRef.current = useReferrals()
			return null
		}

		// 1. Unresolved (loading) session
		currentSession = { data: null, status: 'loading' }
		await renderClient(<Probe />)
		expect(fetchCalls).toBe(0)
		expect(hookRef.current?.data).toBeUndefined()
		expect(hookRef.current?.isPending).toBe(true)
		expect(hookRef.current?.fetchStatus).toBe('idle')
		expect(hookRef.current?.error).toBeNull()
		expect(hookRef.current?.isLoading).toBe(true)

		// 2. Signed-out (unauthenticated) session
		currentSession = { data: null, status: 'unauthenticated' }
		await renderClient(<Probe />)
		expect(fetchCalls).toBe(0)
		expect(hookRef.current?.data).toBeUndefined()
		expect(hookRef.current?.isPending).toBe(true)
		expect(hookRef.current?.fetchStatus).toBe('idle')
		expect(hookRef.current?.error).toBeNull()
		expect(hookRef.current?.isLoading).toBe(false)
		const unauthQuery = queryClient
			.getQueryCache()
			.find({ queryKey: buildReferralsQueryKey(null), exact: true })
		expect(unauthQuery?.observers[0]?.options.refetchInterval).toBe(false)

		// 3. Authenticated status without a resolved user ID
		currentSession = { data: makeSession('   '), status: 'authenticated' }
		await renderClient(<Probe />)
		expect(fetchCalls).toBe(0)
		expect(hookRef.current?.data).toBeUndefined()
		expect(hookRef.current?.isPending).toBe(true)
		expect(hookRef.current?.fetchStatus).toBe('idle')
		expect(hookRef.current?.error).toBeNull()

		// 4. Valid authenticated session fetches immediately and configures 30s polling
		currentSession = { data: makeSession('user-a'), status: 'authenticated' }
		await renderClient(<Probe />)
		await flushAsyncAct()
		expect(fetchCalls).toBe(1)
		expect(hookRef.current?.data?.referral_code).toBe('CODE-A')
		expect(hookRef.current?.error).toBeNull()
		const authQuery = queryClient
			.getQueryCache()
			.find({ queryKey: buildReferralsQueryKey('user-a'), exact: true })
		expect(authQuery?.observers[0]?.options.refetchInterval).toBe(30000)
	})

	test('effect-driven session transitions (A -> signed out -> B) purge obsolete referral cache entries', async () => {
		const dataA = makeReferralsData('user-a', 'REF-ALICE')
		const dataB = makeReferralsData('user-b', 'REF-BOB')

		globalThis.fetch = mock(async () => {
			const activeId = currentSession.data?.user?.id
			const payload = activeId === 'user-b' ? dataB : dataA
			return jsonResponse(payload)
		}) as unknown as typeof fetch

		// Pre-populate legacy ['referrals'] and user-a cache entries in the shared QueryClient
		queryClient.setQueryData(['referrals'], dataA)
		queryClient.setQueryData(buildReferralsQueryKey('user-a'), dataA)

		const { useReferrals } = await import('~/hooks/referrals/use-referrals')
		const hookRef: { current: UseReferralsResult | null } = { current: null }

		function Probe(): null {
			hookRef.current = useReferrals()
			return null
		}

		// Step 1: Mount as user-a; legacy ['referrals'] is purged by effect while user-a remains
		currentSession = { data: makeSession('user-a'), status: 'authenticated' }
		await renderClient(<Probe />)
		await flushAsyncAct()
		expect(hookRef.current?.data?.referral_code).toBe('REF-ALICE')
		expect(queryClient.getQueryData(['referrals'])).toBeUndefined()

		// Step 2: Transition user-a -> signed out; effect clears user-a cache automatically
		currentSession = { data: null, status: 'unauthenticated' }
		await renderClient(<Probe />)
		expect(hookRef.current?.data).toBeUndefined()
		expect(queryClient.getQueryData(buildReferralsQueryKey('user-a'))).toBeUndefined()

		// Step 3: Seed stale user-a entry again, then transition directly to user-b
		queryClient.setQueryData(buildReferralsQueryKey('user-a'), dataA)
		currentSession = { data: makeSession('user-b'), status: 'authenticated' }
		await renderClient(<Probe />)
		await flushAsyncAct()

		expect(queryClient.getQueryData(buildReferralsQueryKey('user-a'))).toBeUndefined()
		expect(hookRef.current?.data?.referral_code).toBe('REF-BOB')
		expect(hookRef.current?.data?.referral_profile?.user_id).toBe('user-b')
	})

	test('uncommitted suspended B render does not corrupt A ref, and late A response after B commits is discarded', async () => {
		const dataA = makeReferralsData('user-a', 'REF-ALICE')
		const dataB = makeReferralsData('user-b', 'REF-BOB')

		const pendingFetches: Array<{
			signal: AbortSignal | null | undefined
			resolve: (response: Response) => void
		}> = []
		let maskAbortOnNextFetch = false

		globalThis.fetch = mock((_input: RequestInfo | URL, init?: RequestInit) => {
			if (maskAbortOnNextFetch && init?.signal) {
				maskAbortOnNextFetch = false
				Object.defineProperty(init.signal, 'aborted', { get: () => false })
			}
			return new Promise<Response>((resolve) => {
				pendingFetches.push({ signal: init?.signal, resolve })
			})
		}) as unknown as typeof fetch

		const { useReferrals } = await import('~/hooks/referrals/use-referrals')
		const hookRef: { current: UseReferralsResult | null } = { current: null }
		const renderedUsers: Array<string | undefined> = []

		function Probe(): null {
			const hook = useReferrals()
			useLayoutEffect(() => {
				hookRef.current = hook
			})
			return null
		}

		function RenderRecorder({ userId }: { userId: string }): null {
			renderedUsers.push(userId)
			return null
		}

		let suspendGate: Promise<void> | null = null
		let triggerTransition!: (nextUserId: string, nextSuspend: boolean) => void

		function TransitionHarness(): ReactNode {
			const [state, setState] = useState({ userId: 'user-a', shouldSuspend: false })
			triggerTransition = (nextUserId: string, nextSuspend: boolean): void => {
				startTransition(() => {
					setState({ userId: nextUserId, shouldSuspend: nextSuspend })
				})
			}
			return (
				<SessionOverrideContext.Provider
					value={{ data: makeSession(state.userId), status: 'authenticated' }}
				>
					<Suspense fallback={null}>
						<RenderRecorder userId={state.userId} />
						<Probe />
						<MaybeSuspend shouldSuspend={state.shouldSuspend} />
					</Suspense>
				</SessionOverrideContext.Provider>
			)
		}

		function MaybeSuspend({ shouldSuspend }: { shouldSuspend: boolean }): null {
			if (shouldSuspend && suspendGate) {
				throw suspendGate
			}
			return null
		}

		// 1. Commit user-a and capture its initial in-flight request (#0)
		await renderClient(<TransitionHarness />)
		expect(pendingFetches).toHaveLength(1)

		// 2. Start a real React transition to user-b whose sibling suspends:
		// Probe renders with user-b on TransitionLane, then MaybeSuspend suspends so user-b does NOT commit
		let releaseSuspense!: () => void
		suspendGate = new Promise<void>((resolve) => {
			releaseSuspense = resolve
		})
		await act(async () => {
			triggerTransition('user-b', true)
		})
		expect(renderedUsers).toContain('user-b')
		expect(pendingFetches[0]?.signal?.aborted).toBe(false)

		// Resolve user-a's request while user-b is still suspended/uncommitted:
		// activeUserIdRef.current remained 'user-a', so user-a's data is accepted cleanly
		await flushAsyncAct(() => {
			pendingFetches[0]?.resolve(jsonResponse(dataA))
		})
		expect(
			queryClient.getQueryData<ReferralsData>(buildReferralsQueryKey('user-a'))?.referral_code,
		).toBe('REF-ALICE')
		expect(hookRef.current?.data?.referral_code).toBe('REF-ALICE')

		// 3. Start a slow user-a refetch (#1) with signal.aborted masked so activeUserIdRef guard is isolated
		maskAbortOnNextFetch = true
		const refetchAPromise = queryClient.refetchQueries({
			queryKey: buildReferralsQueryKey('user-a'),
			exact: true,
		})
		expect(pendingFetches).toHaveLength(2)

		// Commit user-b by releasing the suspended transition
		suspendGate = null
		await flushAsyncAct(() => {
			releaseSuspense()
			triggerTransition('user-b', false)
		})
		expect(pendingFetches.length).toBeGreaterThanOrEqual(3)

		// Resolve user-b's request first, then let slow user-a (#1) finish after user-b committed
		await flushAsyncAct(() => {
			pendingFetches.at(-1)?.resolve(jsonResponse(dataB))
		})
		expect(hookRef.current?.data?.referral_code).toBe('REF-BOB')

		await act(async () => {
			pendingFetches[1]?.resolve(jsonResponse(dataA))
			await refetchAPromise.catch(() => {})
			await new Promise<void>((resolve) => {
				setTimeout(resolve, 10)
			})
		})

		// Late user-a response was rejected by activeUserIdRef guard and user-b remains intact
		expect(queryClient.getQueryData(buildReferralsQueryKey('user-a'))).toBeUndefined()
		expect(
			queryClient.getQueryData<ReferralsData>(buildReferralsQueryKey('user-b'))?.referral_code,
		).toBe('REF-BOB')
		expect(hookRef.current?.data?.referral_code).toBe('REF-BOB')
	})

	test('activateReferral and applyReferralCode invalidate only the originating active account', async () => {
		const dataA = makeReferralsData('user-a', 'REF-ALICE')
		const dataB = makeReferralsData('user-b', 'REF-BOB')

		let resolveDelayedActivate!: (response: Response) => void
		let interceptNextActivate = false
		const fetchedUsers: string[] = []

		globalThis.fetch = mock(async (input: RequestInfo | URL) => {
			const url = String(input)
			if (url.endsWith('/api/referrals/activate')) {
				if (interceptNextActivate) {
					interceptNextActivate = false
					return new Promise<Response>((resolve) => {
						resolveDelayedActivate = resolve
					})
				}
				return jsonResponse({ ok: true })
			}
			if (url.endsWith('/api/referrals/apply')) {
				return jsonResponse({ ok: true })
			}
			const activeId = currentSession.data?.user?.id ?? 'unknown'
			fetchedUsers.push(activeId)
			return jsonResponse(activeId === 'user-b' ? dataB : dataA)
		}) as unknown as typeof fetch

		const { useReferrals } = await import('~/hooks/referrals/use-referrals')
		const hookRef: { current: UseReferralsResult | null } = { current: null }

		function Probe(): null {
			hookRef.current = useReferrals()
			return null
		}

		// 1. Mount as user-a and verify activateReferral + applyReferralCode refetch user-a
		currentSession = { data: makeSession('user-a'), status: 'authenticated' }
		await renderClient(<Probe />)
		await flushAsyncAct()
		expect(fetchedUsers).toEqual(['user-a'])

		await act(async () => {
			await hookRef.current?.activateReferral()
		})
		await flushAsyncAct()
		expect(fetchedUsers).toEqual(['user-a', 'user-a'])

		await act(async () => {
			await hookRef.current?.applyReferralCode('KINDFI2026')
		})
		await flushAsyncAct()
		expect(fetchedUsers).toEqual(['user-a', 'user-a', 'user-a'])

		// 2. Start activateReferral as user-a, switch to user-b before it resolves, then finish mutation
		interceptNextActivate = true
		let pendingActivate: Promise<unknown> = Promise.resolve()
		await act(async () => {
			pendingActivate = hookRef.current?.activateReferral() ?? Promise.resolve()
		})

		currentSession = { data: makeSession('user-b'), status: 'authenticated' }
		await renderClient(<Probe />)
		await flushAsyncAct()
		const fetchesAfterBSwitch = fetchedUsers.length
		expect(fetchedUsers.at(-1)).toBe('user-b')

		await act(async () => {
			resolveDelayedActivate(jsonResponse({ ok: true }))
			await pendingActivate
			await new Promise<void>((resolve) => {
				setTimeout(resolve, 10)
			})
		})

		// Late user-a mutation completion must NOT invalidate/refetch user-b or recreate user-a cache
		expect(fetchedUsers).toHaveLength(fetchesAfterBSwitch)
		expect(queryClient.getQueryData(buildReferralsQueryKey('user-a'))).toBeUndefined()
		expect(
			queryClient.getQueryData<ReferralsData>(buildReferralsQueryKey('user-b'))?.referral_code,
		).toBe('REF-BOB')
	})
})
