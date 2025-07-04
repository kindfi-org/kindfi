import type { Database } from '@services/supabase'
import { createBrowserClient } from '@supabase/ssr'
import { appEnvConfig } from '../../config'
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
	const appConfig = appEnvConfig()
	if (client) {
		return client
	}

	client = createBrowserClient<Database>(
		appConfig.database.url,
		appConfig.database.anonKey,
	)

	return client
}
