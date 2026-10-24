/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import {
	buildNotificationsKeyValues,
	normalizeNotificationFilters,
} from '~/lib/notifications/query-keys'
import type { NotificationFilters, NotificationSort } from '~/lib/types/notification'

const USER_ID = 'user-1'
const SORT: NotificationSort = { field: 'created_at', direction: 'desc' }
const STALE_TIME = 1000 * 60 * 5 // mirrors useNotifications

/** Full key as composed by useSupabaseQuery('notifications', ..., { additionalKeyValues }) */
function notificationsKey(
	filters: NotificationFilters,
	sort: NotificationSort = SORT,
	page = 1,
	pageSize = 20,
) {
	return [
		'supabase',
		'notifications',
		...buildNotificationsKeyValues({ user_id: USER_ID, ...filters }, sort, page, pageSize),
	]
}

describe('normalizeNotificationFilters', () => {
	test('includes every result-changing filter and excludes user_id', () => {
		expect(
			normalizeNotificationFilters({
				user_id: USER_ID,
				is_read: false,
				type: 'escrow_update',
				priority: 'high',
				created_after: new Date('2026-01-01T00:00:00.000Z'),
				created_before: new Date('2026-02-01T00:00:00.000Z'),
			}),
		).toEqual({
			is_read: false,
			type: 'escrow_update',
			priority: 'high',
			created_after: '2026-01-01T00:00:00.000Z',
			created_before: '2026-02-01T00:00:00.000Z',
		})
	})

	test('keeps is_read=false distinct from an unset read filter', () => {
		expect(normalizeNotificationFilters({ is_read: false })).toEqual({ is_read: false })
		expect(normalizeNotificationFilters({})).toEqual({})
	})

	test('omits undefined values', () => {
		expect(
			normalizeNotificationFilters({
				is_read: undefined,
				type: undefined,
				priority: undefined,
				created_after: undefined,
				created_before: undefined,
			}),
		).toEqual({})
	})

	test('keeps invalid dates distinct from unset dates with a sentinel', () => {
		expect(normalizeNotificationFilters({ created_after: new Date('not a date') })).toEqual({
			created_after: '__invalid_date__',
		})
		expect(normalizeNotificationFilters({ created_before: new Date(Number.NaN) })).toEqual({
			created_before: '__invalid_date__',
		})
		expect(normalizeNotificationFilters({ created_after: new Date('not a date') })).not.toEqual(
			normalizeNotificationFilters({}),
		)
	})
})

describe('notifications cache entries within staleTime', () => {
	let client: QueryClient
	let fetches: string[]

	beforeEach(() => {
		client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
		fetches = []
	})

	afterEach(() => {
		client.clear()
	})

	function load(key: unknown[]) {
		return client.fetchQuery({
			queryKey: key,
			queryFn: async () => {
				fetches.push(JSON.stringify(key))
				return { data: [], count: 0 }
			},
			staleTime: STALE_TIME,
		})
	}

	test('switching read status, type, priority or date range fetches a distinct entry', async () => {
		const variants: NotificationFilters[] = [
			{},
			{ is_read: false },
			{ is_read: true },
			{ type: 'project_update' },
			{ type: 'escrow_dispute' },
			{ priority: 'low' },
			{ priority: 'high' },
			{ created_after: new Date('2026-01-01T00:00:00.000Z') },
			{ created_before: new Date('2026-01-31T00:00:00.000Z') },
			{
				created_after: new Date('2026-01-01T00:00:00.000Z'),
				created_before: new Date('2026-01-31T00:00:00.000Z'),
			},
		]

		for (const filters of variants) await load(notificationsKey(filters))

		expect(fetches).toHaveLength(variants.length)
		expect(new Set(fetches).size).toBe(variants.length)
	})

	test('equivalent filter values reuse the fresh entry', async () => {
		await load(
			notificationsKey({
				is_read: false,
				priority: 'high',
				created_after: new Date('2026-01-01T00:00:00.000Z'),
			}),
		)
		await load(
			notificationsKey({
				priority: 'high',
				type: undefined,
				is_read: false,
				created_after: new Date(Date.parse('2026-01-01T00:00:00.000Z')),
			}),
		)

		expect(fetches).toHaveLength(1)
	})

	test('pagination and sorting remain isolated', async () => {
		const filters: NotificationFilters = { is_read: false }
		await load(notificationsKey(filters, SORT, 1, 20))
		await load(notificationsKey(filters, SORT, 2, 20))
		await load(notificationsKey(filters, SORT, 1, 50))
		await load(notificationsKey(filters, { field: 'created_at', direction: 'asc' }, 1, 20))
		await load(notificationsKey(filters, { field: 'priority', direction: 'desc' }, 1, 20))

		expect(fetches).toHaveLength(5)
	})

	test('mutation prefix invalidation reaches every filtered entry', async () => {
		const keys = [
			notificationsKey({}),
			notificationsKey({ is_read: false }),
			notificationsKey({ priority: 'high' }),
			notificationsKey({ created_after: new Date('2026-01-01T00:00:00.000Z') }),
		]
		for (const key of keys) await load(key)

		// Active observer simulates the currently mounted filter view
		const observer = new QueryObserver(client, {
			queryKey: keys[1],
			queryFn: async () => {
				fetches.push(`refetch:${JSON.stringify(keys[1])}`)
				return { data: [], count: 0 }
			},
			staleTime: STALE_TIME,
		})
		const unsubscribe = observer.subscribe(() => {})

		// Same call useNotifications makes in onSuccess
		await client.invalidateQueries({ queryKey: ['supabase', 'notifications'] })
		unsubscribe()

		// Inactive filter entries are marked stale, so switching back refetches them
		for (const key of keys.filter((_, index) => index !== 1)) {
			expect(client.getQueryState(key)?.isInvalidated).toBe(true)
		}
		// The active filter entry is refetched immediately
		expect(fetches).toContain(`refetch:${JSON.stringify(keys[1])}`)

		const before = fetches.length
		await load(keys[2])
		expect(fetches.length).toBe(before + 1)
	})
})

describe('useNotifications cache key', () => {
	const captured: unknown[][] = []

	mock.module('@packages/lib/hooks', () => ({
		useSupabaseQuery: (
			queryName: string,
			_queryFn: unknown,
			options?: { additionalKeyValues?: unknown[] },
		) => {
			if (queryName === 'notifications') captured.push(options?.additionalKeyValues ?? [])
			return { data: undefined, isLoading: false, error: null, refresh: () => {} }
		},
	}))
	mock.module('@packages/lib/supabase-client', () => ({
		createSupabaseBrowserClient: () => ({}),
	}))
	mock.module('~/lib/services/notification-service', () => ({
		NotificationService: class {},
	}))

	beforeEach(() => {
		captured.length = 0
	})

	async function renderKey(filters: NotificationFilters, page = 1) {
		const { useNotifications } = await import('~/hooks/use-notifications')
		function Probe() {
			useNotifications(filters, SORT, page, 20)
			return null
		}
		renderToStaticMarkup(
			<QueryClientProvider client={new QueryClient()}>
				<Probe />
			</QueryClientProvider>,
		)
		return captured.at(-1)
	}

	test('passes every filter, sort and pagination value to the query key', async () => {
		const key = await renderKey(
			{
				user_id: USER_ID,
				is_read: true,
				type: 'kyc_status',
				priority: 'medium',
				created_before: new Date('2026-03-01T00:00:00.000Z'),
			},
			3,
		)

		expect(key).toEqual([
			USER_ID,
			{
				is_read: true,
				type: 'kyc_status',
				priority: 'medium',
				created_before: '2026-03-01T00:00:00.000Z',
			},
			{ field: 'created_at', direction: 'desc' },
			3,
			20,
		])
	})

	test('different filters produce different keys', async () => {
		const unread = await renderKey({ user_id: USER_ID, is_read: false })
		const read = await renderKey({ user_id: USER_ID, is_read: true })
		expect(unread).not.toEqual(read)
	})
})

describe('useNotifications realtime refresh', () => {
	test('realtime events invalidate the notifications prefix instead of refetching one entry', async () => {
		const source = await Bun.file(new URL('../hooks/use-notifications.ts', import.meta.url)).text()
		const realtime = source.slice(
			source.indexOf("'postgres_changes'"),
			source.indexOf('.subscribe('),
		)

		expect(realtime).toContain("queryKey: ['supabase', 'notifications']")
		expect(realtime).toContain("queryKey: ['supabase', 'unread-count']")
		expect(realtime).not.toMatch(/refetch(Ref\.current)?\(/)
	})
})
