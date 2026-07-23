import { appEnvConfig } from '@packages/lib/config'
import jwt from 'jsonwebtoken'

/**
 * Legacy HS256 secret from Supabase Dashboard → Project Settings → API → JWT Settings.
 * Must match the project that serves NEXT_PUBLIC_SUPABASE_URL (not the anon/service key).
 */
export const getSupabaseJwtSecret = (): string | undefined => {
	const secret = process.env.SUPABASE_JWT_SECRET?.trim()
	return secret || undefined
}

export interface SignSupabaseAccessTokenInput {
	userId: string
	email?: string | null
	metadata?: Record<string, unknown>
	expiresInSeconds?: number
}

/**
 * Mint a Supabase-compatible access JWT for RLS (`auth.uid()` / `next_auth.uid()`).
 * Used by NextAuth; passed as `Authorization: Bearer` — not via GoTrue `setSession`.
 */
export const signSupabaseAccessToken = (input: SignSupabaseAccessTokenInput): string | null => {
	const secret = getSupabaseJwtSecret()
	if (!secret) {
		return null
	}

	const config = appEnvConfig('web')
	const supabaseUrl = config.database.url.replace(/\/$/, '')
	if (!supabaseUrl) {
		return null
	}

	const now = Math.floor(Date.now() / 1000)
	const expiresIn = input.expiresInSeconds ?? config.auth.token.expiration

	return jwt.sign(
		{
			aud: 'authenticated',
			exp: now + expiresIn,
			iat: now,
			iss: `${supabaseUrl}/auth/v1`,
			sub: input.userId,
			email: input.email ?? undefined,
			role: 'authenticated',
			app_metadata: { provider: 'nextauth' },
			user_metadata: input.metadata ?? {},
		},
		secret,
		{ algorithm: 'HS256' },
	)
}
