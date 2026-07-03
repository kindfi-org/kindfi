import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { TypedSupabaseClient } from '@packages/lib/types'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

/**
 * Supabase server client scoped to the current NextAuth session so RLS policies
 * (e.g. platform admin checks) can resolve the caller via current_auth_user_id().
 */
export async function getAuthenticatedSupabaseServerClient(): Promise<TypedSupabaseClient> {
	const session = await getServerSession(nextAuthOption)

	return createSupabaseServerClient({
		jwt: session?.supabaseAccessToken,
	})
}
