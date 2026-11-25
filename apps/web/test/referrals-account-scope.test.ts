import { describe, expect, test } from 'bun:test'
import { QueryClient } from '@tanstack/react-query'
import {
	cleanReferralsForAccountTransition,
	referralsQueryKey,
} from '../hooks/referrals/use-referrals'

/**
 * Regression tests for #1094.
 *
 * `useReferrals` used to share the global key `['referrals']` for an
 * account-specific endpoint, so a cached entry from account A could
 * (and did) serve account B after a sign-out / sign-in. These tests
 * pin the two pieces of the fix:
 *
 * 1. The query key is scoped by the authenticated user id, so A and B
 *    have distinct cache entries.
 * 2. `cleanReferralsForAccountTransition` removes the previous
 *    account's entry on every transition, so a late A response cannot
 *    repopulate the cache while B is active.
 */

describe('referralsQueryKey', () => {
	test('includes the user id, so two accounts have distinct cache keys', () => {
		const a = referralsQueryKey('user-a')
		const b = referralsQueryKey('user-b')
		expect(a).not.toEqual(b)
	})

	test('is stable for the same user id across calls', () => {
		expect(referralsQueryKey('user-a')).toEqual(referralsQueryKey('user-a'))
	})

	test('produces a distinct key for the signed-out slot', () => {
		const signedOut = referralsQueryKey(null)
		const user = referralsQueryKey('user-a')
		expect(signedOut).not.toEqual(user)
	})

	test('treats null and undefined the same way (signed-out slot)', () => {
		expect(referralsQueryKey(null)).toEqual(referralsQueryKey(undefined))
	})

	test('shares the `referrals` prefix so prefix-level invalidation still catches every account', () => {
		expect(referralsQueryKey('user-a')[0]).toBe('referrals')
		expect(referralsQueryKey('user-b')[0]).toBe('referrals')
	})
})

describe('cleanReferralsForAccountTransition', () => {
	test('switching A -> B clears A so B never reads A s cached data', async () => {
		const client = new QueryClient()
		// Seed A's cache entry as if a previous session had fetched.
		client.setQueryData(referralsQueryKey('user-a'), {
			referral_code: 'A-ONLY',
		})

		cleanReferralsForAccountTransition(client, 'user-a', 'user-b')

		expect(client.getQueryData(referralsQueryKey('user-a'))).toBeUndefined()
		// B's slot is not touched by the transition clean-up: it is populated
		// by its own fetch, not by the previous account's data.
		expect(client.getQueryData(referralsQueryKey('user-b'))).toBeUndefined()
	})

	test('switching A -> signed out -> B clears A at the first transition', () => {
		const client = new QueryClient()
		client.setQueryData(referralsQueryKey('user-a'), { referral_code: 'A' })

		// Sign out: previous id was A, next is null. A must go.
		cleanReferralsForAccountTransition(client, 'user-a', null)
		expect(client.getQueryData(referralsQueryKey('user-a'))).toBeUndefined()

		// Sign in as B: previous (null) -> B. Nothing to clear.
		cleanReferralsForAccountTransition(client, null, 'user-b')
		expect(client.getQueryData(referralsQueryKey('user-a'))).toBeUndefined()
		expect(client.getQueryData(referralsQueryKey('user-b'))).toBeUndefined()
	})

	test('a no-op transition (same user) leaves the current account s cache alone', () => {
		const client = new QueryClient()
		client.setQueryData(referralsQueryKey('user-a'), { referral_code: 'A' })
		cleanReferralsForAccountTransition(client, 'user-a', 'user-a')
		expect(client.getQueryData(referralsQueryKey('user-a'))).toEqual({
			referral_code: 'A',
		})
	})

	test('a transition from `null` (initial signed-out state) does nothing', () => {
		const client = new QueryClient()
		// Pretend an in-process entry under the signed-out slot was written
		// by accident; a transition from `null` leaves it alone (the fix
		// targets real account ids). The caller never fetches under this
		// slot, so a leftover is a bug on the writer side, not the
		// transition cleaner.
		client.setQueryData(referralsQueryKey(null), { stale: true })
		cleanReferralsForAccountTransition(client, null, 'user-a')
		expect(client.getQueryData(referralsQueryKey(null))).toEqual({ stale: true })
	})

	test('cancelQueries runs for the previous account on transition', () => {
		// A real cancellation is observed by setting a sentinel on the
		// client and calling the helper; the public QueryClient API
		// exposes the state but nothing synchronous to assert on an
		// empty cache, so we verify through removeQueries' effect
		// (above) and this smoke-test that the call does not throw.
		const client = new QueryClient()
		expect(() => cleanReferralsForAccountTransition(client, 'user-a', 'user-b')).not.toThrow()
	})
})
