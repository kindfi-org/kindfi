import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import type { Enums } from '@services/supabase'
import type { NextAuthOptions, User } from 'next-auth'
import { logger } from '@/lib/logger'
import { kindfiPollarProvider } from '~/auth/kindfi-pollar.provider'
import { KindfiSupabaseAdapter } from '~/auth/kindfi-supabase-adapter'
import { kindfiWebAuthnProvider } from '~/auth/kindfi-webauthn.provider'
import { signSupabaseAccessToken } from '~/lib/auth/supabase-access-token'

const appConfig: AppEnvInterface = appEnvConfig('web')

export const nextAuthOption: NextAuthOptions = {
	adapter: KindfiSupabaseAdapter(),
	providers: [kindfiWebAuthnProvider, kindfiPollarProvider],
	pages: {
		signIn: '/sign-in',
		// signOut: '/sign-out',
	},
	callbacks: {
		async jwt({ token, user, account, trigger: _trigger }) {
			// On sign in, populate the token with user data
			if (user) {
				const userData = user as User

				// Set core NextAuth token properties
				token.id = userData.id
				token.email = userData.email
				token.name = user.name
				token.role = userData.userData?.role as Enums<'user_role'>
				token.provider = account?.provider || 'webauthn'
				token.onboardingProvider =
					(userData.userData as { onboarding_provider?: string } | undefined)
						?.onboarding_provider ?? 'legacy_passkey'

				// Add device data for WebAuthn sessions
				if (account?.provider === 'credentials' && userData.device) {
					token.device = userData.device
				}

				// Pollar wallet in session
				if (
					account?.provider === 'pollar' &&
					(userData as User & { wallet?: { address: string } }).wallet
				) {
					token.wallet = (
						userData as User & { wallet: { address: string; provider: string } }
					).wallet
				}

				// Generate separate Supabase access token for RLS (different from NextAuth token)
				const supabaseJwt = signSupabaseAccessToken({
					userId: user.id,
					email: user.email,
					metadata: {
						role: userData.userData?.role,
						provider: account?.provider || 'webauthn',
					},
				})
				if (supabaseJwt) {
					token.supabaseAccessToken = supabaseJwt
				} else if (process.env.NODE_ENV === 'development') {
					logger.warn(
						'[Auth] SUPABASE_JWT_SECRET is missing — browser/server Supabase RLS auth will not work until it is set.',
					)
				}
			}

			// Always return the token to maintain session
			return token
		},
		async session({ session, token }) {
			if (!token) {
				logger.error('❌ No token found in session callback')
				return session
			}

			// Build session from token
			session.user = {
				id: token.id as string,
				name: token.name as string,
				email: token.email as string,
				image: token.image as string,
				jwt: token.sub as string, // NextAuth's primary token identifier
				role: token.role as string,
				userData: {
					role: token.role as Enums<'user_role'>,
					display_name: token.name as string,
					bio: token.bio as string,
				},
			}

			// Add device data for WebAuthn sessions
			if (token.device) {
				session.user.device = token.device
				session.device = token.device
			}

			if (token.wallet) {
				session.user.wallet = token.wallet as { address: string; provider: string }
				session.wallet = token.wallet as { address: string; provider: string }
			}

			if (token.onboardingProvider) {
				session.user.onboardingProvider = token.onboardingProvider as string
			}

			// Add Supabase-specific JWT for RLS (separate from NextAuth token)
			if (token.supabaseAccessToken) {
				session.supabaseAccessToken = token.supabaseAccessToken as string
			}

			return session
		},
		// @ts-expect-error auth param is OK on this scenario as we only return it.
		async authorized({ auth }) {
			return !!auth?.user
		},
		async signIn({ user: _user, account: _account }) {
			return true
		},
	},
	secret: appConfig.auth.secret,
	session: {
		strategy: 'jwt',
		maxAge: appConfig.auth.token.expiration, // 30 days
		updateAge: appConfig.auth.token.update, // 24 hours
	},
	debug: appConfig.env.nodeEnv === 'development',
	theme: {
		colorScheme: 'light',
		brandColor: '#fafafa',
		logo: '/images/kindfi-org.png',
	},
}
