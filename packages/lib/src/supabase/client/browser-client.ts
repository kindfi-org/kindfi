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

	// ? There is a moment in the react render that process.env doesn't exist in the browser hence,
	// ? a fallback is required to add on this render step cycle...
	// ? - @andlerrl
	client = createBrowserClient<Database>(
		appConfig.database.url ||
			process.env.NEXT_PUBLIC_SUPABASE_URL ||
			process.env.SUPABASE_URL ||
			'',
		appConfig.database.anonKey ||
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
			process.env.SUPABASE_ANON_KEY ||
			'',
	)

	return client
}
