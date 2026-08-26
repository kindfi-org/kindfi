import type { Database } from '@services/supabase'
import { createBrowserClient } from '@supabase/ssr'
import { appEnvConfig } from '../../config'
import type { AppEnvInterface } from '../../types'
import type { TypedSupabaseClient } from '../../types/supabase-client.types'

let anonClient: TypedSupabaseClient | undefined

export interface SupabaseBrowserClientOptions {
	/** NextAuth-minted JWT for RLS; sent as Authorization header (not GoTrue setSession). */
	accessToken?: string
}

/**
 * Creates (or reuses) a Supabase browser client.
 *
 * Without `accessToken`, returns a shared anon client. With `accessToken`, returns a
 * per-session client that attaches `Authorization: Bearer <jwt>` for RLS.
 */
export function createSupabaseBrowserClient(
	options?: SupabaseBrowserClientOptions,
): TypedSupabaseClient {
	const appConfig: AppEnvInterface = appEnvConfig()
	const url =
		appConfig.database.url || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
	const anonKey =
		appConfig.database.anonKey ||
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
		process.env.SUPABASE_ANON_KEY ||
		''

	if (options?.accessToken) {
		return createBrowserClient<Database>(url, anonKey, {
			global: {
				headers: {
					Authorization: `Bearer ${options.accessToken}`,
				},
			},
		})
	}

	if (anonClient) {
		return anonClient
	}

	anonClient = createBrowserClient<Database>(url, anonKey)
	return anonClient
}
