import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyAuthentication } from '~/lib/passkey/passkey'
import { createClient } from '~/lib/supabase/server'

export type PasskeyCredentials = {
	authenticatorData: string
	clientDataJSON: string
	signature: string
	credentialId: string
	challenge: string
	userHandle?: string
	email?: string
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	pages: {
		signIn: '/sign-in',
		error: '/error',
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async jwt({ token, user }) {
			// If user just signed in, add their info to the token
			if (user) {
				token.id = user.id
				token.email = user.email

				// Get additional user data from user_profiles table
				const supabase = await createClient()
				const { data: profile } = await supabase
					.from('user_profiles')
					.select('*')
					.eq('user_id', user.id)
					.single()

				if (profile) {
					token.profile = profile
				}

				// Update last_login in auth.users
				await supabase.auth.admin.updateUserById(user.id, {
					user_metadata: {
						last_login: new Date().toISOString(),
					},
				})
			}
			return token
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string

				// Add profile data to session
				if (token.profile) {
					session.user.profile = token.profile
				}
			}
			return session
		},
	},
	providers: [
		CredentialsProvider({
			id: 'passkey',
			name: 'Passkey',
			credentials: {
				email: { type: 'email' },
				authenticatorData: { type: 'text' },
				clientDataJSON: { type: 'text' },
				signature: { type: 'text' },
				credentialId: { type: 'text' },
				challenge: { type: 'text' },
				userHandle: { type: 'text' },
			},
			async authorize(credentials) {
				if (!credentials) return null

				try {
					const { email, ...authData } = credentials as PasskeyCredentials

					// Create a proper authentication response object
					const authResponse: AuthenticationResponseJSON = {
						id: authData.credentialId,
						rawId: authData.credentialId,
						response: {
							authenticatorData: authData.authenticatorData,
							clientDataJSON: authData.clientDataJSON,
							signature: authData.signature,
						},
						type: 'public-key',
						clientExtensionResults: {},
					}

					// Use the existing Redis passkey verification
					const { verified, identifier } = await verifyAuthentication({
						identifier: email || '',
						authenticationResponse: authResponse,
						origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
					})

					if (!verified) return null

					// Get user from Supabase using the verified email
					const supabase = await createClient()
					const { data: userData, error } = await supabase
						.from('auth.users') // Using Supabase Auth Schema
						.select('id, email, raw_user_meta_data')
						.eq('email', identifier)
						.single()

					if (error || !userData) return null

					// Update the last login time for the user
					await supabase.auth.admin.updateUserById(userData.id, {
						user_metadata: {
							last_login: new Date().toISOString(),
						},
					})

					return {
						id: userData.id,
						email: userData.email,
						name: userData.raw_user_meta_data?.name || userData.email,
					}
				} catch (error) {
					console.error('Error authenticating with passkey:', error)
					return null
				}
			},
		}),

		// Add email OTP provider for account recovery
		CredentialsProvider({
			id: 'otp-recovery',
			name: 'Email Recovery',
			credentials: {
				email: { type: 'email' },
				code: { type: 'text' },
			},
			async authorize(credentials) {
				if (!credentials) return null

				try {
					// Verify the OTP code
					const supabase = await createClient()
					const { data, error } = await supabase.auth.verifyOtp({
						email: credentials.email,
						token: credentials.code,
						type: 'recovery',
					})

					if (error || !data.user) return null

					return {
						id: data.user.id,
						email: data.user.email || '',
						name: (data.user.user_metadata?.name as string) || data.user.email,
					}
				} catch (error) {
					console.error('Error recovering with OTP:', error)
					return null
				}
			},
		}),
	],
})

// Types
declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			email: string
			profile?: Record<string, unknown>
		} & DefaultSession['user']
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		profile?: Record<string, unknown>
	}
}
