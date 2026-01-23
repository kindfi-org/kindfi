import type { AdapterAccount } from '@auth/core/adapters'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { appEnvConfig } from '@packages/lib/config'
import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Adapter, AdapterSession, AdapterUser } from 'next-auth/adapters'

interface DeviceData {
	credential_id: string
	public_key: string
	address: string
}

interface UserData {
	role?: string
	display_name?: string
	bio?: string
	image_url?: string
}

interface KindfiUser extends AdapterUser {
	device?: DeviceData
	userData?: UserData
}

/**
 * Custom Supabase adapter for KindFi WebAuthn authentication
 * Extends the standard Supabase adapter to handle WebAuthn credentials
 * and maintain device/user data synchronization
 */
export function KindfiSupabaseAdapter(): Adapter {
	const appConfig = appEnvConfig('web')
	const supabase = createSupabaseBrowserClient()

	// Get the base Supabase adapter
	const baseAdapter = SupabaseAdapter({
		url: appConfig.database.url,
		secret: appConfig.database.serviceRoleKey,
	})

	return {
		...baseAdapter,

		async createUser(user: Omit<AdapterUser, 'id'>) {
			console.log('🔧 KindfiSupabaseAdapter: Creating user', user)

			try {
				// Create user using base adapter first
				if (!baseAdapter.createUser) {
					throw new Error('Base adapter createUser method is not available')
				}
				const createdUser = await baseAdapter.createUser(user as AdapterUser)

				// Only create profile if user creation was successful
				if (!createdUser?.id || !createdUser?.email) {
					// Handle user creation failure
					console.error(
						'🔧 KindfiSupabaseAdapter: User creation failed',
						createdUser,
					)
					throw new Error('User creation failed')
				}
				// Check if profile already exists to avoid conflicts
				const { data: existingProfile } = await supabase
					.from('profiles')
					.select('id')
					.eq('next_auth_user_id', createdUser.id)
					.single()

				if (existingProfile) {
					console.warn(
						'🔧 KindfiSupabaseAdapter: Profile already exists',
						existingProfile.id,
					)
					throw new Error('Profile already exists')
				}
				// Create corresponding profile in public schema
				const { error: profileError } = await supabase.from('profiles').insert({
					id: createdUser.id,
					next_auth_user_id: createdUser.id,
					email: createdUser.email,
					display_name: createdUser.name || null,
					image_url: createdUser.image || null,
					role: 'pending', // Default role: unselected until user chooses donor or creator
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})

				if (profileError) {
					console.error(
						'🔧 KindfiSupabaseAdapter: Profile creation error',
						profileError,
					)
					// Don't throw here to avoid breaking the auth flow
					// The profile can be created later if needed
				}

				console.log(
					'🔧 KindfiSupabaseAdapter: User created successfully',
					createdUser,
				)
				return createdUser
			} catch (error) {
				console.error('🔧 KindfiSupabaseAdapter: User creation error', error)
				throw error
			}
		},

		async getUser(id: string) {
			console.log('🔧 KindfiSupabaseAdapter: Getting user', id)

			try {
				// Get user using base adapter
				if (!baseAdapter.getUser) {
					return null
				}
				const user = await baseAdapter.getUser(id)

				if (!user) {
					return null
				}
				// Enhance user with KindFi-specific data
				const { data: profileData } = await supabase
					.from('profiles')
					.select('role, display_name, bio, image_url')
					.eq('next_auth_user_id', id)
					.single()

				if (profileData) {
					;(user as KindfiUser).userData = profileData as UserData
				}

				console.log('🔧 KindfiSupabaseAdapter: User retrieved', user)
				return user
			} catch (error) {
				console.error('🔧 KindfiSupabaseAdapter: Get user error', error)
				return null
			}
		},

		async getUserByEmail(email: string) {
			console.log('🔧 KindfiSupabaseAdapter: Getting user by email', email)

			try {
				// Get user using base adapter
				if (!baseAdapter.getUserByEmail) {
					return null
				}
				const user = await baseAdapter.getUserByEmail(email)

				if (!user) {
					return null
				}
				// Enhance user with KindFi-specific data
				const { data: profileData } = await supabase
					.from('profiles')
					.select('role, display_name, bio, image_url')
					.eq('email', email)
					.single()

				if (profileData) {
					;(user as KindfiUser).userData = profileData as UserData
				}

				console.log('🔧 KindfiSupabaseAdapter: User retrieved by email', user)
				return user
			} catch (error) {
				console.error(
					'🔧 KindfiSupabaseAdapter: Get user by email error',
					error,
				)
				return null
			}
		},

		async getUserByAccount({
			providerAccountId,
			provider,
		}: {
			providerAccountId: string
			provider: string
		}) {
			console.log('🔧 KindfiSupabaseAdapter: Getting user by account', {
				providerAccountId,
				provider,
			})

			// For WebAuthn provider, we need to handle credential lookup differently
			if (provider === 'webauthn') {
				// Look up user by credential ID in devices table
				const { data: deviceData, error: deviceError } = await supabase
					.from('devices')
					.select(
						`
            next_auth_user_id,
            credential_id,
            public_key,
            address
          `,
					)
					.eq('credential_id', providerAccountId)
					.single()

				if (deviceError || !deviceData) {
					console.log(
						'🔧 KindfiSupabaseAdapter: No device found for credential',
						providerAccountId,
					)
					return null
				}

				// Get the NextAuth user via base adapter (already scoped to next_auth schema)
				let nextAuthUser: AdapterUser | null = null
				if (baseAdapter.getUser) {
					nextAuthUser = await baseAdapter.getUser(
						deviceData.next_auth_user_id || '',
					)
				}

				if (!nextAuthUser) {
					console.log(
						'🔧 KindfiSupabaseAdapter: No NextAuth user found',
						deviceData.next_auth_user_id,
					)
					return null
				}

				// Get profile data
				const { data: profileData } = await supabase
					.from('profiles')
					.select('role, display_name, bio, image_url')
					.eq('next_auth_user_id', deviceData.next_auth_user_id || '')
					.single()
				const userData = nextAuthUser as unknown as KindfiUser
				const kindfiUser: KindfiUser = {
					id: userData.id,
					email: userData.email,
					name: userData.name,
					image: userData.image,
					emailVerified: userData.emailVerified,
					device: {
						credential_id: deviceData.credential_id,
						public_key: deviceData.public_key,
						address: deviceData.address,
					},
					userData: (profileData as UserData) || undefined,
				}

				console.log(
					'🔧 KindfiSupabaseAdapter: User retrieved by WebAuthn account',
					kindfiUser,
				)
				return kindfiUser
			}

			// For other providers, use base adapter
			if (!baseAdapter.getUserByAccount) {
				return null
			}
			return await baseAdapter.getUserByAccount({
				providerAccountId,
				provider,
			})
		},

		async linkAccount(
			account: AdapterAccount,
		): Promise<AdapterAccount | null | undefined> {
			console.log('🔧 KindfiSupabaseAdapter: Linking account', account)

			// For WebAuthn provider, we handle the account linking differently
			if (account.provider === 'webauthn') {
				// WebAuthn account linking is handled through device registration
				// The account is already linked through the devices table
				console.log(
					'🔧 KindfiSupabaseAdapter: WebAuthn account linking handled via devices table',
				)
				return account
			}

			// For other providers, use base adapter
			if (!baseAdapter.linkAccount) {
				return account
			}
			return (await baseAdapter.linkAccount(account)) || null
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
			console.log('🔧 KindfiSupabaseAdapter: Creating session', {
				sessionToken,
				userId,
				expires,
			})

			if (!baseAdapter.createSession) {
				throw new Error('Base adapter createSession method is not available')
			}
			const session = await baseAdapter.createSession({
				sessionToken,
				userId,
				expires,
			})

			console.log('🔧 KindfiSupabaseAdapter: Session created', session)
			return session
		},

		async getSessionAndUser(sessionToken: string) {
			console.log(
				'🔧 KindfiSupabaseAdapter: Getting session and user',
				sessionToken,
			)

			if (!baseAdapter.getSessionAndUser) {
				return null
			}
			const result = await baseAdapter.getSessionAndUser(sessionToken)

			if (result?.user) {
				// Enhance user with KindFi-specific data
				const { data: profileData } = await supabase
					.from('profiles')
					.select('role, display_name, bio, image_url')
					.eq('next_auth_user_id', result.user.id)
					.single()

				if (profileData) {
					;(result.user as KindfiUser).userData = profileData as UserData
				}
			}

			console.log(
				'🔧 KindfiSupabaseAdapter: Session and user retrieved',
				result,
			)
			return result
		},

		async updateSession(
			session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>,
		) {
			console.log('🔧 KindfiSupabaseAdapter: Updating session', session)

			if (!baseAdapter.updateSession) {
				return null
			}
			const updatedSession = await baseAdapter.updateSession(session)

			console.log('🔧 KindfiSupabaseAdapter: Session updated', updatedSession)
			return updatedSession
		},

		async deleteSession(sessionToken: string) {
			console.log('🔧 KindfiSupabaseAdapter: Deleting session', sessionToken)

			if (!baseAdapter.deleteSession) {
				return
			}
			await baseAdapter.deleteSession(sessionToken)

			console.log('🔧 KindfiSupabaseAdapter: Session deleted')
		},

		async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>) {
			console.log('🔧 KindfiSupabaseAdapter: Updating user', user)

			if (!baseAdapter.updateUser) {
				throw new Error('Base adapter updateUser method is not available')
			}
			const updatedUser = await baseAdapter.updateUser(user)

			console.log('🔧 KindfiSupabaseAdapter: User updated', updatedUser)
			return updatedUser
		},
	}
}
