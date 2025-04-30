import type { Database } from '@services/supabase/src/database.types'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export type TypedSupabaseClient = SupabaseClient<Database>

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
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
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
