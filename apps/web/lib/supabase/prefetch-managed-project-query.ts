import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TypedSupabaseClient } from '@packages/lib/types'
import type { QueryClient } from '@tanstack/react-query'

type ManagedProjectQueryFn<TData> = (client: TypedSupabaseClient) => Promise<TData>

/**
 * Prefetch project data for manage routes using the service-role client.
 * Manage layouts already enforce authorization before child pages render.
 */
export async function prefetchManagedProjectQuery<TData>(
	queryClient: QueryClient,
	queryName: string,
	queryFn: ManagedProjectQueryFn<TData>,
	additionalKeyValues?: unknown[],
) {
	const baseKey = ['supabase', queryName]
	const queryKey = additionalKeyValues?.length ? [...baseKey, ...additionalKeyValues] : baseKey

	await queryClient.prefetchQuery({
		queryKey,
		queryFn: () => queryFn(supabaseServiceRole),
	})
}
