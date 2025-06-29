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
			and(eq(challenges.identifier, identifier), eq(challenges.rpId, rpId)),
		)

	// Insert the new challenge with 5-minute expiration
	await db.insert(challenges).values({
		userId: userId || null,
		identifier,
		rpId,
		challenge,
		expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now as ISO string
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
				eq(challenges.rpId, rpId),
				// Only return non-expired challenges
				gt(challenges.expiresAt, new Date().toISOString()),
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
			and(eq(challenges.identifier, identifier), eq(challenges.rpId, rpId)),
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
					eq(devices.rpId, rpId),
					...(userId ? [eq(devices.userId, userId)] : []),
				),
			)

		const credentials: WebAuthnCredential[] = deviceRecords.map((device) => ({
			id: device.credentialId,
			publicKey: base64ToUint8Array(device.publicKey),
			counter: device.signCount,
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
					eq(devices.rpId, rpId),
					eq(devices.credentialId, credential.id),
				),
			)
			.limit(1)

		if (existingDevice.length > 0) {
			// Update existing device
			await db
				.update(devices)
				.set({
					signCount: credential.counter,
					transports: credential.transports || [],
					lastUsedAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
				.where(eq(devices.id, existingDevice[0].id))
		} else {
			// Insert new device
			await db.insert(devices).values({
				userId: userId || null,
				identifier,
				rpId,
				credentialId: credential.id,
				publicKey: uint8ArrayToBase64(credential.publicKey),
				signCount: credential.counter,
				transports: credential.transports || [],
				credentialType: 'public-key',
				aaguid: '00000000-0000-0000-0000-000000000000',
				profileVerificationStatus: 'unverified',
				deviceType: 'single_device',
				backupState: 'not_backed_up',
				lastUsedAt: new Date().toISOString(),
			})
		}
	}
}

/**
 * Clean up expired challenges (can be called periodically)
 */
export const cleanupExpiredChallenges = async (): Promise<void> => {
	const db = await getDb()

	await db
		.delete(challenges)
		.where(lt(challenges.expiresAt, new Date().toISOString()))
}

/**
 * Get all devices for a user
 */
export const getUserDevices = async (userId: string): Promise<Device[]> => {
	const db = await getDb()

	return await db
		.select()
		.from(devices)
		.where(eq(devices.userId, userId))
		.orderBy(desc(devices.lastUsedAt))
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
			lastUsedAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
		.where(eq(devices.credentialId, credentialId))
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
			and(eq(devices.userId, userId), eq(devices.credentialId, credentialId)),
		)
}
