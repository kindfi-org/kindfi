import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Global utility for performing server-side Supabase queries.
 *
 * ✅ Designed for use in any layer (page, layout, route handler).
 * ❌ Does not rely on DrizzleORM — use for admin-level reads, direct Supabase access, etc.
 * 💡 Use only in server-side contexts (e.g., getServerSideProps, layouts, Server Components).
 *
 * @template TData The type of data returned
 * @param {string} key Unique context or label for debugging
 * @param {(client: SupabaseClient) => Promise<TData>} queryFn Your Supabase query using the client
 * @returns {Promise<TData>} Fetched data
 *
 * @example
 * const project = await fetchSupabaseQuery('project-by-id', (client) =>
 *   client.from('projects').select('*').eq('id', id).single()
 * );
 */
export async function fetchSupabaseQuery<TData>(
	key: string,
	queryFn: (client: SupabaseClient) => Promise<TData>,
): Promise<TData> {
	const supabase = createServerComponentClient({ cookies })

	try {
		const data = await queryFn(supabase)
		return data
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err))
		console.error(`[ServerQuery][${key}]`, error)
		throw error
	}
}
