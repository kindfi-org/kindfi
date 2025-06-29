import type {
	AuthenticatorTransportFuture,
	WebAuthnCredential,
} from '@simplewebauthn/server'
import { and, desc, eq, gt, lt } from 'drizzle-orm'
import { getDb } from '../db'
import { type Challenge, type Device, challenges, devices } from './schema'

// Utility functions for data conversion
const uint8ArrayToBase64 = (array: Uint8Array): string => {
	return Buffer.from(array).toString('base64')
}

const base64ToUint8Array = (base64: string): Uint8Array => {
	return new Uint8Array(Buffer.from(base64, 'base64'))
}

/**
 * Save a challenge to the database
 */
export const saveChallenge = async ({
	identifier,
	rpId,
	challenge,
	userId,
}: {
	identifier: string
	rpId: string
	challenge: string
	userId?: string
}): Promise<void> => {
	const db = await getDb()

	// First, clean up any existing challenges for this identifier/rpId combination
	await db
		.delete(challenges)
		.where(
			and(eq(challenges.identifier, identifier), eq(challenges.rp_id, rpId)),
		)

	// Insert the new challenge with 5-minute expiration
	await db.insert(challenges).values({
		user_id: userId || null,
		identifier,
		rp_id: rpId,
		challenge,
		expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
	})
}

/**
 * Get a challenge from the database
 */
export const getChallenge = async ({
	identifier,
	rpId,
	userId,
}: {
	identifier: string
	rpId: string
	userId?: string
}): Promise<string | null> => {
	const db = await getDb()

	const result = await db
		.select()
		.from(challenges)
		.where(
			and(
				eq(challenges.identifier, identifier),
				eq(challenges.rp_id, rpId),
				// Only return non-expired challenges
				gt(challenges.expires_at, new Date()),
			),
		)
		.limit(1)

	return result[0]?.challenge || null
}

/**
 * Delete a challenge from the database
 */
export const deleteChallenge = async ({
	identifier,
	rpId,
	userId,
}: {
	identifier: string
	rpId: string
	userId?: string
}): Promise<void> => {
	const db = await getDb()

	await db
		.delete(challenges)
		.where(
			and(eq(challenges.identifier, identifier), eq(challenges.rp_id, rpId)),
		)
}

/**
 * Get user credentials from the database
 */
export const getUser = async ({
	rpId,
	identifier,
	userId,
}: {
	rpId: string
	identifier: string
	userId?: string
}): Promise<{
	identifier: string
	credentials: WebAuthnCredential[]
} | null> => {
	try {
		const db = await getDb()

		const deviceRecords = await db
			.select()
			.from(devices)
			.where(
				and(
					eq(devices.identifier, identifier),
					eq(devices.rp_id, rpId),
					...(userId ? [eq(devices.user_id, userId)] : []),
				),
			)

		const credentials: WebAuthnCredential[] = deviceRecords.map((device) => ({
			id: device.credential_id,
			publicKey: base64ToUint8Array(device.public_key),
			counter: device.sign_count,
			transports: device.transports as AuthenticatorTransportFuture[],
		}))

		return {
			identifier,
			credentials,
		}
	} catch (error) {
		console.error('Error getting user by identifier', error)
		return null
	}
}

/**
 * Save user credentials to the database
 */
export const saveUser = async ({
	rpId,
	identifier,
	user,
	userId,
}: {
	rpId: string
	identifier: string
	user: { credentials: WebAuthnCredential[] }
	userId?: string
}): Promise<void> => {
	const db = await getDb()

	// Insert or update devices for this user
	for (const credential of user.credentials) {
		// Check if this credential already exists
		const existingDevice = await db
			.select()
			.from(devices)
			.where(
				and(
					eq(devices.identifier, identifier),
					eq(devices.rp_id, rpId),
					eq(devices.credential_id, credential.id),
				),
			)
			.limit(1)

		if (existingDevice.length > 0) {
			// Update existing device
			await db
				.update(devices)
				.set({
					sign_count: credential.counter,
					transports: credential.transports || [],
					last_used_at: new Date(),
					updated_at: new Date(),
				})
				.where(eq(devices.id, existingDevice[0].id))
		} else {
			// Insert new device
			await db.insert(devices).values({
				user_id: userId || null,
				identifier,
				rp_id: rpId,
				credential_id: credential.id,
				public_key: uint8ArrayToBase64(credential.publicKey),
				sign_count: credential.counter,
				transports: credential.transports || [],
				credential_type: 'public-key',
				aaguid: '00000000-0000-0000-0000-000000000000',
				profile_verification_status: 'unverified',
				device_type: 'single_device',
				backup_state: 'not_backed_up',
				last_used_at: new Date(),
			})
		}
	}
}

/**
 * Clean up expired challenges (can be called periodically)
 */
export const cleanupExpiredChallenges = async (): Promise<void> => {
	const db = await getDb()

	await db.delete(challenges).where(lt(challenges.expires_at, new Date()))
}

/**
 * Get all devices for a user
 */
export const getUserDevices = async (userId: string): Promise<Device[]> => {
	const db = await getDb()

	return await db
		.select()
		.from(devices)
		.where(eq(devices.user_id, userId))
		.orderBy(desc(devices.last_used_at))
}

/**
 * Update device last used timestamp
 */
export const updateDeviceLastUsed = async (
	credentialId: string,
): Promise<void> => {
	const db = await getDb()

	await db
		.update(devices)
		.set({
			last_used_at: new Date(),
			updated_at: new Date(),
		})
		.where(eq(devices.credential_id, credentialId))
}

/**
 * Remove a device by credential ID
 */
export const removeDevice = async (
	userId: string,
	credentialId: string,
): Promise<void> => {
	const db = await getDb()

	await db
		.delete(devices)
		.where(
			and(eq(devices.user_id, userId), eq(devices.credential_id, credentialId)),
		)
}
