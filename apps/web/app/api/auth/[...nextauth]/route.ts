import type { Enums } from '@services/supabase'
import NextAuth from 'next-auth'
import { getToken } from 'next-auth/jwt' // This import might become unused or used differently if custom JWT generation for Hasura is re-implemented correctly. For now, let's keep it if other parts of the file might use it, though the problematic block is removed.
import { cookies } from 'next/headers' // This import will become unused after the change.
import { kindfiWebAuthnProvider } from '~/auth/kindfi-webauthn.provider'
import { appConfig } from '~/lib/config/app.config'
// Removed unused import: import { UpdatedAt } from '../../../../lib/types/date.types';

const handler = NextAuth({
	providers: [kindfiWebAuthnProvider],
	pages: {
		signIn: '/auth/signin',
		// TODO: to be implemented
		signOut: '/auth/signout',
	},
	callbacks: {
		async jwt({ token, user, account }) {
			if (!user) {
				return token
			}

			console.log('🗝️ JWT callback triggered with user:', user)
			console.log('🗝️ JWT callback triggered with account:', account)
			console.log('🗝️ JWT callback triggered with token:', token)

			token.role = user.userData.role as Enums<'user_role'>
			token.id = user.id
			token.email = user.email
			token.provider = account?.provider || 'webauthn'
			token.name = user.name

			return token // Ensure the modified token is returned
		},
		async session({ session, token }) {
			console.log('🗝️ Session callback triggered with session:', session)
			console.log('🗝️ Session callback triggered with token:', token)
			if (!token || !session.user) {
				console.error('No token found in session callback')
				return session
			}
			//* Attach the user details and JWT to the session object
			session.user = {
				id: token.id as string,
				email: token.email as string,
				name: token.name as string,
				image: token.image as string,
				jwt: token.sub as string,
				role: token.role as Enums<'user_role'>,
			}

			console.log(
				'🗝️ Session created with Hasura JWT ',
				session.user?.jwt ? 'Present' : 'Missing',
			)
			return session
		},
		// @ts-ignore
		async authorized({ auth }) {
			return !!auth?.user
		},
		async signIn({ user, account }) {
			// TODO: Add custom sign-in logic if needed?
			return true
		},
	},
	secret: appConfig.auth.secret,
	session: {
		strategy: 'jwt',
		maxAge: appConfig.auth.token.expiration, // 30 days
		updateAge: appConfig.auth.token.update, // 24 hours
	},
	debug: process.env.NODE_ENV === 'development',
	theme: {
		colorScheme: 'light',
		brandColor: '#fafafa',
		logo: '/images/kindfi-org.png',
	},
})

export { handler as GET, handler as POST }
