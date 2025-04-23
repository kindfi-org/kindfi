import { supabase } from '@/lib/supabase-client'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
	type QueryKey,
	type UseQueryOptions,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'

type QueryFn<TData> = (client: SupabaseClient) => Promise<TData>

interface UseSupabaseQueryOptions<TData>
	extends Omit<
		UseQueryOptions<TData, Error, TData, QueryKey>,
		'queryKey' | 'queryFn'
	> {
	/**
	 * This determines if the cache for this query should be cleared when the component unmounts
	 */
	clearOnUnmount?: boolean

	/**
	 * Additional values to compose a dynamic and unique query key
	 */
	additionalKeyValues?: unknown[]
}

/**
 * Custom hook for querying data from Supabase with consistent caching and error handling
 *
 * @template TData The type of the data returned from Supabase
 * @param {string} queryName Unique name for this query, used in cache key
 * @param {QueryFn<TData>} queryFn Async function that performs Supabase fetch
 * @param {UseSupabaseQueryOptions<TData>} options TanStack query options + extra Supabase-specific ones
 *
 * @example
 * const { data, isLoading, error, refresh } = useSupabaseQuery(
 *   'user-profile',
 *   (client) => client.from('profiles').select('*').eq('id', userId).single(),
 *   {
 *     enabled: !!userId,
 *     staleTime: 1000 * 60, // 1 minute
 *     additionalKeyValues: [userId],
 *     clearOnUnmount: true,
 *   }
 * );
 */
export function useSupabaseQuery<TData>(
	queryName: string,
	queryFn: QueryFn<TData>,
	options?: UseSupabaseQueryOptions<TData>,
) {
	const queryClient = useQueryClient()
	const mountedAt = useRef(new Date())

	// Memoized query key for stable caching
	const queryKey = useMemo(() => {
		const baseKey = ['supabase', queryName]
		if (options?.additionalKeyValues?.length) {
			return [...baseKey, ...options.additionalKeyValues]
		}
		return baseKey
	}, [queryName, options?.additionalKeyValues])

	const query = useQuery<TData, Error>({
		queryKey,
		queryFn: async () => {
			try {
				const result = await queryFn(supabase)
				return result
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err))
				console.error(`[SupabaseQuery][${queryName}]`, error)
				throw error
			}
		},
		...options,
	})

	useEffect(() => {
		return () => {
			if (options?.clearOnUnmount) {
				queryClient.removeQueries({ queryKey })
			}
		}
	}, [queryKey, options?.clearOnUnmount, queryClient])

	return {
		...query,
		refresh: query.refetch,
		queryKey,
		mountedAt,
	}
}
