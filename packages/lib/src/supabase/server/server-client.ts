import type { Database } from '@services/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { appEnvConfig } from '../../config'
import type { AppEnvInterface } from '../../types'
import type { TypedSupabaseClient } from '../../types/supabase-client.types'

const appConfig: AppEnvInterface = appEnvConfig()

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
export async function createSupabaseServerClient(supabaseServerClientProps?: {
	jwt?: string
	accessToken?: () => Promise<string>
}): Promise<TypedSupabaseClient> {
	const { jwt, accessToken } = supabaseServerClientProps || {}
	const cookieStore = await cookies()

	return createServerClient<Database>(
		appConfig.database.url,
		appConfig.database.anonKey,
		{
			...(jwt || accessToken
				? {
						accessToken: jwt
							? async () => {
									return jwt
								}
							: accessToken,
					}
				: {}),
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options)
						})
					} catch (_error) {
						// The `set` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	)
}
