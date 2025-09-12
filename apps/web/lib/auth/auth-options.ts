import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import type { Enums } from '@services/supabase'
import jwt from 'jsonwebtoken'
import type { NextAuthOptions, User } from 'next-auth'
import { KindfiSupabaseAdapter } from '~/auth/kindfi-supabase-adapter'
import { kindfiWebAuthnProvider } from '~/auth/kindfi-webauthn.provider'
import { Logger } from '../logger'

const appConfig: AppEnvInterface = appEnvConfig('web')
const logger = new Logger()
export const nextAuthOption: NextAuthOptions = {
	adapter: KindfiSupabaseAdapter(),
	providers: [kindfiWebAuthnProvider],
	pages: {
		signIn: '/sign-in',
		// TODO: to be implemented
		// signOut: '/sign-out',
	},
	callbacks: {
		async jwt({ token, user, account }) {
			if (!user) {
				return token
			}

			console.log('🗝️ JWT callback triggered with user:', user)
			console.log('🗝️ JWT callback triggered with account:', account)
			console.log('🗝️ JWT callback triggered with token:', token)
			const userData = user as User
			// Maintain the existing JWT structure for compatibility
			token.role = userData.userData?.role as Enums<'user_role'>
			token.id = userData.id
			token.email = userData.email
			token.provider = account?.provider || 'webauthn'
			token.name = user.name

			// Add device data for WebAuthn sessions
			if (account?.provider === 'webauthn' && userData.device) {
				token.device = userData.device
			}

			// Generate Supabase access token for RLS
			const signingSecret = process.env.SUPABASE_JWT_SECRET
			if (signingSecret) {
				const payload = {
					aud: 'authenticated',
					exp: Math.floor(Date.now() / 1000) + appConfig.auth.token.expiration,
					sub: user.id,
					email: user.email,
					role: 'authenticated',
					user_metadata: {
						role: userData.userData?.role,
						provider: account?.provider || 'webauthn',
					},
				}
				token.supabaseAccessToken = jwt.sign(payload, signingSecret)
			}

			return token // Ensure the modified token is returned
		},
		async session({ session, token }) {
			console.log('🗝️ Session callback triggered with session:', session)
			console.log('🗝️ Session callback triggered with token:', token)
			if (!token || !session.user) {
				logger.error({
					eventType: 'Session Callback Error',
					error: 'No token found in session callback',
				})
				return session
			}

			// Attach the user details and JWT to the session object (maintain existing structure)
			session.user = {
				id: token.id as string,
				email: token.email as string,
				name: token.name as string,
				image: token.image as string,
				jwt: token.sub as string,
				role: token.role as Enums<'user_role'>,
			}

			// Add Supabase access token for RLS
			if (token.supabaseAccessToken) {
				session.supabaseAccessToken = token.supabaseAccessToken
			}

			// Add device data for WebAuthn sessions
			if (token.device) {
				session.device = token.device
			}

			console.log(
				'🗝️ Session created with Hasura JWT ',
				session.user?.jwt ? 'Present' : 'Missing',
			)
			return session
		},
		// @ts-expect-error auth param is OK on this scenario as we only return it.
		async authorized({ auth }) {
			return !!auth?.user
		},
		async signIn({ user, account }) {
			// TODO: Add custom sign-in logic if needed?
			console.log('🗝️ SignIn callback triggered with user:', { user, account })
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
