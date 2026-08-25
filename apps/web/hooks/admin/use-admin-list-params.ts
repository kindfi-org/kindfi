'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { z } from 'zod'
import { normalizeAdminListParams, parseAdminListParams } from '~/lib/validators/admin-list-params'

type ParamPatch = Record<string, string | number | undefined>

/**
 * URL-backed list state for admin surfaces. Search, filters, sorting, and
 * pagination all live in the query string so views can be bookmarked and
 * shared between administrators. Invalid values fall back to schema defaults.
 */
export function useAdminListParams<Schema extends z.ZodType>(schema: Schema) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const params = useMemo(
		() => parseAdminListParams(schema, new URLSearchParams(searchParams.toString())),
		[schema, searchParams],
	)

	// Patches are rebased on the latest query string (updated optimistically on
	// every patch) so a debounced search callback cannot clobber a filter
	// change that landed while the debounce timer was running.
	const latestQueryRef = useRef(searchParams.toString())
	useEffect(() => {
		latestQueryRef.current = searchParams.toString()
	}, [searchParams])

	const applyPatch = useCallback(
		(patch: ParamPatch) => {
			const next = new URLSearchParams(latestQueryRef.current)
			for (const [key, value] of Object.entries(patch)) {
				if (value === undefined || value === '') {
					next.delete(key)
				} else {
					next.set(key, String(value))
				}
			}
			// Changing any filter invalidates the current page position.
			if (!('page' in patch)) {
				next.delete('page')
			}
			const query = next.toString()
			latestQueryRef.current = query
			router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
		},
		[pathname, router],
	)

	const setParam = useCallback(
		(key: string, value: string | number | undefined) => applyPatch({ [key]: value }),
		[applyPatch],
	)

	const setPage = useCallback((page: number) => applyPatch({ page }), [applyPatch])

	const resetFilters = useCallback(() => {
		router.replace(pathname, { scroll: false })
	}, [pathname, router])

	const normalizedParams = useMemo(
		() => normalizeAdminListParams(params as Record<string, unknown>),
		[params],
	)

	return { params, normalizedParams, setParam, setParams: applyPatch, setPage, resetFilters }
}
