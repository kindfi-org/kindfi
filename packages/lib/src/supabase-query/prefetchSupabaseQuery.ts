import type { SupabaseClient } from '@supabase/supabase-js'
import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { fetchSupabaseQuery } from './fetchSupabaseQuery'

/**
 * Server-side helper to prefetch and cache Supabase queries for SSR with TanStack Query
 *
 * ✅ Use in layouts, pages, or server components
 * ✅ Avoids duplication of fetch + cache logic
 *
 * @template TData The return type of the query
 * @param {QueryClient} queryClient A TanStack QueryClient instance
 * @param {string} queryName A base name for the cache key
 * @param {(client: SupabaseClient) => Promise<TData>} queryFn Supabase data fetcher
 * @param {unknown[]} [additionalKeyValues] Optional cache key dependencies
 *
 * @example
 * await prefetchSupabaseQuery(queryClient, 'profile', (client) =>
 *   client.from('profiles').select('*').eq('id', userId).single(), [userId]
 * );
 */
export async function prefetchSupabaseQuery<TData>(
	queryClient: QueryClient,
	queryName: string,
	queryFn: (client: SupabaseClient) => Promise<TData>,
	additionalKeyValues: unknown[] = [],
): Promise<void> {
	const queryKey: QueryKey = ['supabase', queryName, ...additionalKeyValues]

	await queryClient.prefetchQuery({
		queryKey,
		queryFn: () => fetchSupabaseQuery(queryName, queryFn),
	})
}
