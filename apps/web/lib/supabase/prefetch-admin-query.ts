import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TypedSupabaseClient } from '@packages/lib/types'
import type { QueryClient } from '@tanstack/react-query'

type AdminQueryFn<TData> = (client: TypedSupabaseClient) => Promise<TData>

/**
 * Prefetch admin data using the service-role client.
 * Admin layouts already enforce platform-admin authorization.
 */
export async function prefetchAdminQuery<TData>(
	queryClient: QueryClient,
	queryName: string,
	queryFn: AdminQueryFn<TData>,
	additionalKeyValues?: unknown[],
) {
	const baseKey = ['supabase', queryName]
	const queryKey = additionalKeyValues?.length ? [...baseKey, ...additionalKeyValues] : baseKey

	await queryClient.prefetchQuery({
		queryKey,
		queryFn: () => queryFn(supabaseServiceRole),
	})
}
