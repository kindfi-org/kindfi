import type { Database } from '@services/supabase'
import { createBrowserClient } from '@supabase/ssr'
import type { TypedSupabaseClient } from '../../types/supabase-client.type'

let client: TypedSupabaseClient | undefined

/**
 * Creates (or reuses) a singleton Supabase browser client.
 *
 * Designed for client-side usage in React components.
 *
 * @returns Supabase browser client instance.
 *
 * @example
 * const supabase = createSupabaseBrowserClient();
 * const { data } = await supabase.from('categories').select('*');
 */
export function createSupabaseBrowserClient() {
	if (client) {
		return client
	}

	client = createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
	)

	return client
}
