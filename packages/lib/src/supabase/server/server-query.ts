import type { QueryClient } from '@tanstack/react-query'
import type { TypedSupabaseClient } from '../../types/supabase-client.type'
import { createSupabaseServerClient } from './server-client'

type ServerQueryFn<TData> = (client: TypedSupabaseClient) => Promise<TData>

/**
 * Fetch Supabase data in Server Components using a typed client.
 *
 * @template TData The type of data returned.
 * @param queryName Unique cache key identifier.
 * @param queryFn Function that uses the Supabase client to fetch data.
 * @returns Promise with the fetched data.
 *
 * @example
 * const project = await fetchSupabaseServer('project', async (supabase) => {
 *   const { data, error } = await supabase.from('projects').select('*').eq('id', '123').single();
 *   if (error) throw error;
 *   return data;
 * });
 */
export async function fetchSupabaseServer<TData>(
	queryName: string,
	queryFn: ServerQueryFn<TData>,
): Promise<TData> {
	const supabase = await createSupabaseServerClient()

	try {
		return await queryFn(supabase)
	} catch (error) {
		console.error(`Error in server query ${queryName}:`, error)
		throw error instanceof Error ? error : new Error(String(error))
	}
}

/**
 * Prefetches Supabase query on the server for hydration on the client.
 *
 * @template TData The type of data being prefetched.
 * @param queryClient The React Query client instance.
 * @param queryName Base name for the query key.
 * @param queryFn The function to run the Supabase fetch.
 * @param additionalKeyValues Extra params to build a unique cache key.
 *
 * @example
 * await prefetchSupabaseQuery(queryClient, 'tags', async (supabase) => {
 *   const { data, error } = await supabase.from('tags').select('*');
 *   if (error) throw error;
 *   return data;
 * }, ['project-123']);
 */
export async function prefetchSupabaseQuery<TData>(
	queryClient: QueryClient,
	queryName: string,
	queryFn: ServerQueryFn<TData>,
	additionalKeyValues?: unknown[],
) {
	const baseKey = ['supabase', queryName]
	const queryKey = additionalKeyValues?.length
		? [...baseKey, ...additionalKeyValues]
		: baseKey

	const supabase = await createSupabaseServerClient()

	await queryClient.prefetchQuery({
		queryKey,
		queryFn: () => queryFn(supabase),
	})
}
