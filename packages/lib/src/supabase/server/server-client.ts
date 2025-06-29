import type { Database } from '@services/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { appEnvConfig } from '~/packages/lib/src/config'
import type { TypedSupabaseClient } from '../../types/supabase-client.type'

const appConfig = appEnvConfig()

/**
 * Creates a new Supabase server-side client using cookies for authentication.
 *
 * Intended for Server Components and API routes.
 *
 * @returns A Supabase client bound to the current user's session.
 *
 * @example
 * const supabase = await createSupabaseServerClient();
 * const { data } = await supabase.from('projects').select('*');
 */
export async function createSupabaseServerClient(): Promise<TypedSupabaseClient> {
	const cookieStore = await cookies()

	return createServerClient<Database>(
		appConfig.database.url,
		appConfig.database.anonKey,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet) {
					try {
						// biome-ignore lint/complexity/noForEach: <explanation>
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options)
						})
					} catch (error) {
						// The `set` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	)
}
