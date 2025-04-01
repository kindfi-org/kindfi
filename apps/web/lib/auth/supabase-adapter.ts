import type { SupabaseClient } from '@supabase/supabase-js'
import type {
	Adapter,
	AdapterAccount,
	AdapterSession,
	AdapterUser,
} from 'next-auth/adapters'
import { createClient } from '~/lib/supabase/server'

export async function SupabaseAdapter(): Promise<Adapter> {
	const supabase: SupabaseClient = await createClient()

	return {
		async createUser(user: Omit<AdapterUser, 'id'>) {
			const { data, error } = await supabase.auth.admin.createUser({
				email: user.email as string,
				email_confirm: true,
				user_metadata: {
					name: user.name,
					image: user.image,
				},
			})

			if (error) throw error
			return {
				id: data.user.id,
				email: data.user.email || '',
				emailVerified: data.user.email_confirmed_at
					? new Date(data.user.email_confirmed_at)
					: null,
				name: (data.user.user_metadata?.name as string) || null,
				image: (data.user.user_metadata?.image as string) || null,
			}
		},

		async getUser(id: string) {
			const { data, error } = await supabase.auth.admin.getUserById(id)

			if (error || !data.user) return null

			return {
				id: data.user.id,
				email: data.user.email || '',
				emailVerified: data.user.email_confirmed_at
					? new Date(data.user.email_confirmed_at)
					: null,
				name: (data.user.user_metadata?.name as string) || null,
				image: (data.user.user_metadata?.image as string) || null,
			}
		},

		async getUserByEmail(email: string) {
			const { data, error } = await supabase
				.from('users')
				.select('*')
				.eq('email', email)
				.single()

			if (error || !data) return null

			return {
				id: data.id,
				email: data.email || '',
				emailVerified: data.email_confirmed_at
					? new Date(data.email_confirmed_at)
					: null,
				name: (data.raw_user_meta_data?.name as string) || null,
				image: (data.raw_user_meta_data?.image as string) || null,
			}
		},

		async getUserByAccount({
			providerAccountId,
			provider,
		}: {
			providerAccountId: string
			provider: string
		}) {
			const { data, error } = await supabase
				.from('identities')
				.select('*, users:user_id(*)')
				.eq('provider', provider)
				.eq('identity_data->>sub', providerAccountId)
				.single()

			if (error || !data) return null

			const userData = data.users
			if (!userData) return null

			return {
				id: userData.id,
				email: userData.email || '',
				emailVerified: userData.email_confirmed_at
					? new Date(userData.email_confirmed_at)
					: null,
				name: (userData.raw_user_meta_data?.name as string) || null,
				image: (userData.raw_user_meta_data?.image as string) || null,
			}
		},

		async updateUser(user: Partial<AdapterUser> & { id: string }) {
			const { data, error } = await supabase.auth.admin.updateUserById(
				user.id,
				{
					email: user.email,
					user_metadata: {
						name: user.name,
						image: user.image,
					},
				},
			)

			if (error) throw error

			return {
				id: data.user.id,
				email: data.user.email || '',
				emailVerified: data.user.email_confirmed_at
					? new Date(data.user.email_confirmed_at)
					: null,
				name: (data.user.user_metadata?.name as string) || null,
				image: (data.user.user_metadata?.image as string) || null,
			}
		},

		async deleteUser(userId: string) {
			const { error } = await supabase.auth.admin.deleteUser(userId)
			if (error) throw error
		},

		async linkAccount(account: AdapterAccount) {
			// This is handled automatically by Supabase Auth when using OAuth providers
			// We don't need to manually link accounts
			return account
		},

		async unlinkAccount({
			providerAccountId,
			provider,
		}: {
			providerAccountId: string
			provider: string
		}) {
			// Not easily possible with Supabase Auth
			// Would require custom implementation
			return
		},

		async createSession({
			sessionToken,
			userId,
			expires,
		}: {
			sessionToken: string
			userId: string
			expires: Date
		}) {
			const { data, error } = await supabase
				.from('sessions')
				.insert({
					user_id: userId,
					expires: expires.toISOString(),
					session_token: sessionToken,
				})
				.select()
				.single()

			if (error) throw error

			return {
				userId: data.user_id,
				sessionToken: data.session_token,
				expires: new Date(data.expires),
			}
		},

		async getSessionAndUser(sessionToken: string) {
			const { data, error } = await supabase
				.from('sessions')
				.select('*, users:user_id(*)')
				.eq('session_token', sessionToken)
				.single()

			if (error || !data || !data.users) return null

			const userData = data.users

			return {
				session: {
					userId: data.user_id,
					sessionToken: data.session_token,
					expires: new Date(data.expires),
				},
				user: {
					id: userData.id,
					email: userData.email,
					emailVerified: userData.email_confirmed_at
						? new Date(userData.email_confirmed_at)
						: null,
					name: (userData.raw_user_meta_data?.name as string) || null,
					image: (userData.raw_user_meta_data?.image as string) || null,
				},
			}
		},

		async updateSession(
			session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>,
		) {
			if (!session.expires) return null

			const { data, error } = await supabase
				.from('sessions')
				.update({
					expires: session.expires.toISOString(),
				})
				.eq('session_token', session.sessionToken)
				.select()
				.single()

			if (error) throw error

			return {
				userId: data.user_id,
				sessionToken: data.session_token,
				expires: new Date(data.expires),
			}
		},

		async deleteSession(sessionToken: string) {
			const { error } = await supabase
				.from('sessions')
				.delete()
				.eq('session_token', sessionToken)

			if (error) throw error
		},

		// We're not implementing verification tokens since we're using Supabase Auth
		async createVerificationToken() {
			throw new Error('Not implemented')
		},

		async useVerificationToken() {
			throw new Error('Not implemented')
		},
	}
}
