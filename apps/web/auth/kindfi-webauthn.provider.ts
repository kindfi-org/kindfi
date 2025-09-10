import { db, devices, profiles } from '@packages/drizzle'
import { and, eq } from 'drizzle-orm'
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

		// TODO: Add on-chain verification of the user device.
		// ? We are only checking if the device exists in the database and the signature match but
		// ? we don't check if is actually registered in the auth_controller contract.

		try {
			// First, check if user profile exists using Drizzle
			const profileData = await db
				.select({
					id: profiles.id,
					nextAuthUserId: profiles.nextAuthUserId,
					displayName: profiles.displayName,
					bio: profiles.bio,
					imageUrl: profiles.imageUrl,
					role: profiles.role,
				})
				.from(profiles)
				.where(eq(profiles.id, credentials.userId))
				.limit(1)

			const userData = profileData[0]

			if (!userData) {
				console.error(
					'NextAuth mapped profile not found for userId:',
					credentials.userId,
				)
				throw new Error('NextAuth user not found')
			}

			// Get device data using Drizzle
			const deviceData = await db
				.select({
					credentialId: devices.credentialId,
					publicKey: devices.publicKey,
					address: devices.address,
					userId: devices.userId,
					nextAuthUserId: devices.nextAuthUserId,
				})
				.from(devices)
				.where(
					and(
						eq(devices.credentialId, credentials.credentialId),
						// !BUG FOUND: pubkey is not the same while sign up and login hence, in sign up fails...
						// ! This happens because the pre address is parsed in one way and the sing in the other (when data saves) hence, the values are unmatched
						// TODO: Fix pre and actual user address to parse match.
						// ? Fallback created to be /sign-in
						eq(devices.publicKey, credentials.pubKey),
						eq(devices.userId, userData.id),
					),
				)
				.limit(1)

			console.log('deviceData', deviceData)

			const deviceInfo = deviceData[0]

			if (!deviceInfo) {
				console.error(
					'Error fetching device data for credentialId:',
					credentials.credentialId,
				)
				throw new Error('Device not found or credentials mismatch')
			}

			console.log('🔓 User data fetched successfully: ', userData)
			console.log('🔓 Device data fetched successfully: ', deviceInfo)

			return {
				id: credentials.userId,
				email: credentials.email,
				name: userData.displayName || credentials.email,
				image: userData.imageUrl || null,
				device: {
					credential_id: deviceInfo.credentialId,
					public_key: deviceInfo.publicKey,
					address: deviceInfo.address,
				},
				userData: {
					role: userData.role,
					display_name: userData.displayName || undefined,
					bio: userData.bio || undefined,
					image_url: userData.imageUrl || undefined,
				},
			}
		} catch (error) {
			console.error('Database error during authorization:', error)
			throw new Error('Authentication failed')
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
