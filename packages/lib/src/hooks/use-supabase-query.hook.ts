import {
	type QueryKey,
	type UseQueryOptions,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { createSupabaseBrowserClient } from '../supabase/client/browser-client'
import type { TypedSupabaseClient } from '../types/supabase-client.type'

type QueryFn<TData> = (client: TypedSupabaseClient) => Promise<TData>

interface UseSupabaseQueryOptions<TData>
	extends Omit<
		UseQueryOptions<TData, Error, TData, QueryKey>,
		'queryKey' | 'queryFn'
	> {
	clearOnUnmount?: boolean
	additionalKeyValues?: unknown[]
}

/**
 * Custom hook for fetching Supabase data with TanStack Query.
 *
 * @template TData The shape of the returned data.
 * @param queryName Unique name used in the cache key.
 * @param queryFn Function that performs the Supabase fetch.
 * @param options Optional query config (e.g. staleTime, enabled).
 * @returns Query result and a `refresh()` method.
 *
 * @example
 * const { data, isLoading, refresh } = useSupabaseQuery('categories', async (supabase) => {
 *   const { data, error } = await supabase.from('categories').select('*');
 *   if (error) throw error;
 *   return data;
 * });
 */
export function useSupabaseQuery<TData>(
	queryName: string,
	queryFn: QueryFn<TData>,
	options?: UseSupabaseQueryOptions<TData>,
) {
	const queryClient = useQueryClient()
	const supabase = createSupabaseBrowserClient()

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
				return await queryFn(supabase)
			} catch (error) {
				console.error(`Error in query ${queryName}:`, error)
				throw error instanceof Error ? error : new Error(String(error))
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
	}, [queryClient, queryKey, options?.clearOnUnmount])

	return {
		...query,
		refresh: () => query.refetch(),
	}
}
