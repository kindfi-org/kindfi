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

	// Extract project ref from URL for cookie name
	const url = new URL(appConfig.database.url)
	const projectRef = url.hostname.split('.')[0]
	const authCookieName = `sb-${projectRef}-auth-token`

	// If a JWT is provided, use it as accessToken for proper RLS authentication
	// This allows RLS policies to identify the user via current_auth_user_id()
	const resolvedAccessToken = accessToken
		? accessToken
		: jwt
			? async () => jwt
			: undefined

	return createServerClient<Database>(
		appConfig.database.url,
		appConfig.database.anonKey,
		{
			...(resolvedAccessToken
				? {
						accessToken: resolvedAccessToken,
					}
				: {}),
			cookies: {
				getAll() {
					const allCookies = cookieStore.getAll()

					// If a custom JWT is provided and no accessToken function exists,
					// inject it as a Supabase auth cookie as fallback
					if (jwt && !accessToken) {
						const existingAuthCookie = allCookies.find(
							(cookie) => cookie.name === authCookieName,
						)

						// Only inject if not already present
						if (!existingAuthCookie) {
							return [
								...allCookies,
								{
									name: authCookieName,
									value: JSON.stringify({
										access_token: jwt,
										refresh_token: '',
										expires_at: Math.floor(Date.now() / 1000) + 3600,
										token_type: 'bearer',
										user: {},
									}),
								},
							]
						}
					}

					return allCookies
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
