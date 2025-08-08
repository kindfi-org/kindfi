import { supabase } from '@packages/lib/supabase'
import type { Tables } from '@services/supabase'
import type { User } from 'next-auth'
import CredentialsProvider, {
	type CredentialInput,
} from 'next-auth/providers/credentials'

export const kindfiWebAuthnProvider = CredentialsProvider({
	name: 'Credentials',
	credentials: {
		userId: { label: 'User ID', type: 'text' },
		email: { label: 'Email', type: 'email' },
		pubKey: { label: 'Public Key', type: 'text' },
		credentialId: { label: 'Credential ID', type: 'text' },
		address: { label: 'Address', type: 'text' },
	} as Record<keyof KindfiWebAuthnCredentials, CredentialInput>,
	async authorize(credentialsArg, _req): Promise<User | null> {
		const credentials = credentialsArg as KindfiWebAuthnCredentials | undefined
		console.log('🗝️ login with credentials -> ', credentials)

		if (!credentials) {
			console.error('No credentials provided')
			return null
		}

		const deviceCredentials = {
			pubKey: credentials.pubKey,
			credentialId: credentials.credentialId,
		}

		// TODO: Add on-chain verification of the user device

		// First, check if user exists in NextAuth users table (via profiles mapping instead of querying cross-schema directly)
		const { data: profileUser, error: profileLookupError } = await supabase
			.from('profiles')
			.select('next_auth_user_id, display_name, bio, image_url, role')
			.eq('next_auth_user_id', credentials.userId)
			.single()

		if (profileLookupError || !profileUser) {
			console.error('NextAuth mapped profile not found:', {
				error: profileLookupError,
			})
			throw new Error('NextAuth user not found')
		}

		// Get user profile data (already retrieved above, but keep existing logic for clarity)
		const userData = profileUser as Tables<'profiles'> | null

		// Get device data
		const { data: device, error: deviceError } = await supabase
			.from('devices')
			.select()
			.eq('credential_id', deviceCredentials.credentialId)
			.eq('public_key', deviceCredentials.pubKey)
			.eq('next_auth_user_id', credentials.userId)
			.single()

		const deviceData = device as Tables<'devices'> | null

		if (deviceError) {
			console.error('Error fetching device data:', { error: deviceError })
			throw new Error('Error fetching device data')
		}

		console.log('🔓 User data fetched successfully: ', userData)
		console.log('🔓 Device data fetched successfully: ', deviceData)

		return {
			id: credentials.userId,
			email: credentials.email,
			name: userData?.display_name || credentials.email,
			image: userData?.image_url || null,
			device: deviceData
				? {
						credential_id: deviceData.credential_id,
						public_key: deviceData.public_key,
						address: deviceData.address,
					}
				: undefined,
			userData: userData
				? {
						role: userData.role,
						display_name: userData.display_name,
						bio: userData.bio || undefined,
						image_url: userData.image_url || undefined,
					}
				: undefined,
		}
	},
})

export function nanoid(type: 'string' | 'number' | 'uuid' = 'uuid'): string {
	let id = ''

	switch (type) {
		case 'string':
			id = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
			break
		case 'number':
			id = 'xxxxxxxx'
			break
		case 'uuid':
			id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
			break
		default:
			throw new Error('Invalid type specified for nanoid')
	}

	return id.replace(/[xy]/g, (char) => {
		const random = (Math.random() * 16) | 0
		const idValue = char === 'x' ? random : (random & 0x3) | 0x8

		if (type === 'string') {
			return String.fromCharCode(97 + idValue) // Convert to a letter
		}

		return idValue.toString(type === 'number' ? undefined : 16) // Convert to hex
	})
}

export interface KindfiWebAuthnCredentials {
	userId: string
	pubKey: string
	credentialId: string
	address: string
	email: string
}
