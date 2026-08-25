import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TypedSupabaseClient } from '@packages/lib/types'
import type { QueryClient } from '@tanstack/react-query'
import { adminQueryKey } from '~/lib/validators/admin-list-params'

type AdminQueryFn<TData> = (client: TypedSupabaseClient) => Promise<TData>

/**
 * Prefetch a redesigned admin surface using the service-role client under
 * the same `['admin', surface, params]` key the client hooks derive, so
 * hydration always matches. Admin layouts already enforce platform-admin
 * authorization.
 */
export async function prefetchAdminSurface<TData>(
	queryClient: QueryClient,
	surface: string,
	params: Record<string, unknown> | undefined,
	queryFn: AdminQueryFn<TData>,
) {
	await queryClient.prefetchQuery({
		queryKey: adminQueryKey(surface, params),
		queryFn: () => queryFn(supabaseServiceRole),
	})
}

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
