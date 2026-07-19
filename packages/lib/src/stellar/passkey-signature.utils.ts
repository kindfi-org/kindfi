import { Buffer } from 'node:buffer'
import { createHash, createPublicKey, createVerify } from 'node:crypto'
import { db, devices } from '@packages/drizzle'
import { eq } from 'drizzle-orm'
import { logger } from '../logger'

/**
 * Converts uncompressed public key to DER format for crypto verification.
 * This is the standard ASN.1 DER encoding for P-256 public keys.
 */
export function convertUncompressedToDER(uncompressedKey: Buffer): Buffer {
	const derPrefix = Buffer.from([
		0x30,
		0x59, // SEQUENCE, length
		0x30,
		0x13, // SEQUENCE, length
		0x06,
		0x07,
		0x2a,
		0x86,
		0x48,
		0xce,
		0x3d,
		0x02,
		0x01, // OID for EC public key
		0x06,
		0x08,
		0x2a,
		0x86,
		0x48,
		0xce,
		0x3d,
		0x03,
		0x01,
		0x07, // OID for P-256 curve
		0x03,
		0x42,
		0x00, // BIT STRING, length, unused bits
	])

	return Buffer.concat([derPrefix, uncompressedKey])
}

/**
 * Verifies SECP256R1 signature using Node.js crypto
 */
export async function verifySECP256R1Signature(
	authenticatorData: string,
	clientDataJSON: string,
	signature: string,
	publicKey: Buffer,
): Promise<boolean> {
	try {
		// Create the signed data (authenticator data + client data hash)
		const authDataBuffer = Buffer.from(authenticatorData, 'base64')
		const clientDataBuffer = Buffer.from(clientDataJSON, 'base64')
		const clientDataHash = createHash('sha256').update(clientDataBuffer).digest()

		const signedData = Buffer.concat([authDataBuffer, clientDataHash])
		const signatureBuffer = Buffer.from(signature, 'base64')

		// Convert uncompressed public key to DER format for verification
		const publicKeyDER = convertUncompressedToDER(publicKey)

		// Create public key object
		const publicKeyObj = createPublicKey({
			key: publicKeyDER,
			format: 'der',
			type: 'spki',
		})

		// Verify signature
		const verify = createVerify('SHA256')
		verify.update(signedData)
		const isValid = verify.verify(publicKeyObj, signatureBuffer)

		return isValid
	} catch (error) {
		logger.error(
			'SECP256R1 verification failed',
			error instanceof Error ? error : new Error(String(error)),
		)
		return false
	}
}

/**
 * Gets the public key for a contract from the devices table
 */
export async function getPublicKeyForContract(contractId: string): Promise<Buffer | null> {
	try {
		// Query database for device record with this contract address
		const deviceRecord = await db
			.select({
				publicKey: devices.publicKey,
				deviceName: devices.deviceName,
				credentialId: devices.credentialId,
			})
			.from(devices)
			.where(eq(devices.address, contractId))
			.limit(1)

		if (deviceRecord.length === 0) {
			return null
		}

		const device = deviceRecord[0]

		// The publicKey field should contain the CBOR-encoded public key
		if (!device.publicKey) {
			return null
		}

		// Check if the public key is already a hex string or base64
		let publicKeyBuffer: Buffer
		try {
			// Try to decode as base64 first (most common format)
			publicKeyBuffer = Buffer.from(device.publicKey, 'base64')
		} catch {
			try {
				// Try as hex string
				publicKeyBuffer = Buffer.from(device.publicKey, 'hex')
			} catch {
				// Assume it's already a raw string
				publicKeyBuffer = Buffer.from(device.publicKey, 'utf8')
			}
		}

		return publicKeyBuffer
	} catch (error) {
		logger.error(
			'Error retrieving public key from database',
			error instanceof Error ? error : new Error(String(error)),
			{ contractId },
		)
		return null
	}
}
