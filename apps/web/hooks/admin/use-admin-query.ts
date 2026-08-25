'use client'

import { useQuery } from '@tanstack/react-query'
import {
	buildAdminListQueryString,
	normalizeAdminListParams,
} from '~/lib/validators/admin-list-params'

/**
 * Builds the TanStack Query key for an admin surface. Shared by client hooks
 * and server prefetching so hydration always matches.
 */
export function adminQueryKey(
	surface: string,
	params?: Record<string, unknown>,
): [string, string, Record<string, string>] | [string, string] {
	if (!params) return ['admin', surface]
	return ['admin', surface, normalizeAdminListParams(params)]
}

async function fetchAdminApi<TData>(path: string, params?: Record<string, unknown>) {
	const query = params ? buildAdminListQueryString(params) : ''
	const response = await fetch(query ? `/api/admin/${path}?${query}` : `/api/admin/${path}`)
	if (!response.ok) {
		const body = (await response.json().catch(() => null)) as { error?: string } | null
		throw new Error(body?.error ?? `Admin request failed (${response.status})`)
	}
	return (await response.json()) as TData
}

/**
 * Fetches an admin API route with a stable `['admin', surface, params]` key.
 * Previous data is kept while a new page/filter combination loads so list
 * layouts do not collapse between pages.
 */
export function useAdminQuery<TData>(
	surface: string,
	options?: {
		params?: Record<string, unknown>
		path?: string
		enabled?: boolean
		staleTime?: number
	},
) {
	const { params, path = surface, enabled = true, staleTime } = options ?? {}

	return useQuery<TData>({
		queryKey: adminQueryKey(surface, params),
		queryFn: () => fetchAdminApi<TData>(path, params),
		enabled,
		staleTime,
		placeholderData: (previousData) => previousData,
	})
}
