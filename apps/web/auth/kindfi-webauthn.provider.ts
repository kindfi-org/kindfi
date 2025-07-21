import { supabase } from '@packages/lib/supabase'
import type { Tables } from '@services/supabase'
import { omit } from 'lodash'
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
	async authorize(credentialsArg, _req) {
		const credentials = credentialsArg as KindfiWebAuthnCredentials | undefined
		console.log('🗝️ login with credentials -> ', credentials)

		if (!credentials) {
			console.error('No credentials provided')
			throw new Error('No credentials provided')
		}

		const deviceCredentials = {
			pubKey: credentials.pubKey,
			credentialId: credentials.credentialId,
		}

		// TODO: Add on-chain verification of the user device

		// ? When on-chain verification completes, we can fetch the user data from Supabase
		const supabaseAuth = await supabase.auth.admin.getUserById(
			credentials.userId,
		)

		if (supabaseAuth.error) {
			console.error('Error fetching user by ID:', {
				error: supabaseAuth.error,
			})
			throw new Error('Error fetching user by ID')
		}
		if (!supabaseAuth.data.user) {
			console.error('User not found for ID:', credentials.userId)
			throw new Error('User not found')
		}

		const { data: user, error: userError } = await supabase
			.from('profiles')
			.select('role, display_name, bio, image_url')
			.eq('id', credentials.userId)
			.single()
		const { data: device, error: deviceError } = await supabase
			.from('devices')
			.select()
			.eq('credential_id', deviceCredentials.credentialId)
			.eq('public_key', deviceCredentials.pubKey)
			.eq('user_id', credentials.userId)
			.single()
		const deviceData = device as Tables<'devices'> | null
		const userData = user as Tables<'profiles'> | null

		if (userError) {
			console.error('Error fetching user data:', { error: userError })
			throw new Error('Error fetching user data')
		}
		if (deviceError) {
			console.error('Error fetching device data:', { error: deviceError })
			throw new Error('Error fetching device data')
		}

		console.log('🔓 User data fetched successfully: ', userData)
		console.log('🔓 Device data fetched successfully: ', deviceData)

		return {
			id: credentials.userId,
			email: credentials.email,
			device: omit(deviceData, ['user_id']),
			userData,
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
