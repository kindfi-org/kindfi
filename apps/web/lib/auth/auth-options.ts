import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import type { Enums } from '@services/supabase'
import jwt from 'jsonwebtoken'
import type { NextAuthOptions, User } from 'next-auth'
import { KindfiSupabaseAdapter } from '~/auth/kindfi-supabase-adapter'
import { kindfiWebAuthnProvider } from '~/auth/kindfi-webauthn.provider'

const appConfig: AppEnvInterface = appEnvConfig('web')

export const nextAuthOption: NextAuthOptions = {
	adapter: KindfiSupabaseAdapter(),
	providers: [kindfiWebAuthnProvider],
	pages: {
		signIn: '/sign-in',
		// TODO: to be implemented
		// signOut: '/sign-out',
	},
	callbacks: {
		async jwt({ token, user, account, trigger: _trigger }) {
			// On sign in, populate the token with user data
			if (user) {
				console.log('🗝️ JWT callback - New sign in:', {
					userId: user.id,
					provider: account?.provider,
				})

				const userData = user as User

				// Set core NextAuth token properties
				token.id = userData.id
				token.email = userData.email
				token.name = user.name
				token.role = userData.userData?.role as Enums<'user_role'>
				token.provider = account?.provider || 'webauthn'

				// Add device data for WebAuthn sessions
				if (account?.provider === 'credentials' && userData.device) {
					token.device = userData.device
				}

				// Generate separate Supabase access token for RLS (different from NextAuth token)
				const signingSecret = process.env.SUPABASE_JWT_SECRET
				if (signingSecret) {
					const supabasePayload = {
						aud: 'authenticated',
						exp:
							Math.floor(Date.now() / 1000) + appConfig.auth.token.expiration,
						sub: user.id,
						email: user.email,
						role: 'authenticated',
						user_metadata: {
							role: userData.userData?.role,
							provider: account?.provider || 'webauthn',
						},
					}
					const supabaseJwt = jwt.sign(supabasePayload, signingSecret)
					token.supabaseAccessToken = supabaseJwt
					token.sub = supabaseJwt
				}
			}

			// Always return the token to maintain session
			return token
		},
		async session({ session, token }) {
			if (!token) {
				console.error('❌ No token found in session callback')
				return session
			}

			console.log('🗝️ Session callback - Building session:', {
				hasToken: !!token,
				tokenId: token.id,
				tokenSub: token.sub,
			})

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

			// Add Supabase-specific JWT for RLS (separate from NextAuth token)
			if (token.supabaseAccessToken) {
				session.supabaseAccessToken = token.supabaseAccessToken as string
			}

			console.log('🗝️ Session created:', {
				hasNextAuthToken: !!session.user?.jwt,
				hasSupabaseToken: !!session.supabaseAccessToken,
				userId: session.user?.id,
			})

			return session
		},
		// @ts-expect-error auth param is OK on this scenario as we only return it.
		async authorized({ auth }) {
			return !!auth?.user
		},
		async signIn({ user, account }) {
			console.log('🗝️ SignIn callback triggered:', {
				userId: user.id,
				provider: account?.provider,
			})
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
