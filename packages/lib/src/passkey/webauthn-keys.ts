// Skipping using 'node:buffer' due web compilation errors (lack of `node:` prefix package support)
// import { Buffer } from 'node:buffer'
// import { createHash } from 'node:crypto'

import { Buffer } from 'buffer'
import * as CBOR from 'cbor-x/decode'
import { createHash } from 'crypto'

/**
 * WebAuthn/COSE Public Key Utilities for Stellar Smart Contracts
 *
 * WebAuthn returns public keys in COSE/CBOR format, but Stellar smart contracts
 * expect raw uncompressed secp256r1 public keys (65 bytes: 0x04 + X + Y)
 *
 * This module provides utilities to convert between formats.
 */

/**
 * Convert COSE/CBOR-encoded WebAuthn public key to uncompressed secp256r1 format
 *
 * @param cborPublicKey - CBOR-encoded COSE public key from WebAuthn
 * @returns Uncompressed public key (65 bytes: 0x04 || X || Y)
 */
export function convertCoseToUncompressedPublicKey(
	cborPublicKey: Buffer | Uint8Array | string,
): Buffer {
	try {
		// Convert input to Buffer if needed
		let keyBuffer: Buffer
		if (typeof cborPublicKey === 'string') {
			keyBuffer = Buffer.from(cborPublicKey, 'base64')
		} else if (cborPublicKey instanceof Uint8Array) {
			keyBuffer = Buffer.from(cborPublicKey)
		} else {
			keyBuffer = cborPublicKey
		}

		console.log('🔍 Converting COSE public key to uncompressed format...')
		console.log('   Input length:', keyBuffer.length, 'bytes')

		// If already uncompressed format (65 bytes with 0x04 prefix)
		if (keyBuffer.length === 65 && keyBuffer[0] === 0x04) {
			console.log('✅ Public key already in uncompressed format')
			return keyBuffer
		}

		// Decode CBOR to get COSE key
		const decoded = CBOR.decode(keyBuffer)

		// Handle both direct COSE key and wrapped formats
		let coseKey = decoded
		if (decoded.authData) {
			// Extract from attestation object
			const authData = decoded.authData as Buffer
			const credentialPublicKeyOffset = 55 + 32 + 4 + 2 + 16
			const publicKeyData = authData.subarray(credentialPublicKeyOffset)
			coseKey = CBOR.decode(publicKeyData)
		}

		// Extract COSE key parameters
		// COSE key format (CBOR map with negative integer keys):
		// kty (1): Key type (2 = EC2)
		// alg (3): Algorithm (-7 = ES256)
		// crv (-1): Curve (1 = P-256)
		// x (-2): X coordinate (32 bytes)
		// y (-3): Y coordinate (32 bytes)
		const kty = coseKey[1] as number
		const alg = coseKey[3] as number
		const crv = coseKey[-1] as number
		const xCoord = coseKey[-2] as Buffer
		const yCoord = coseKey[-3] as Buffer

		console.log('🔍 COSE key parameters:', {
			kty: kty,
			alg: alg,
			crv: crv,
			xCoordLength: xCoord?.length,
			yCoordLength: yCoord?.length,
		})

		// Validate key type
		if (kty && kty !== 2) {
			throw new Error(`Invalid key type: ${kty} (expected 2 for EC2)`)
		}

		// Validate algorithm (optional check)
		if (alg && alg !== -7) {
			console.warn(`⚠️ Unexpected algorithm: ${alg} (expected -7 for ES256)`)
		}

		// Validate curve
		if (crv !== 1) {
			throw new Error(`Invalid curve: ${crv} (expected 1 for P-256/secp256r1)`)
		}

		// Validate coordinates
		if (!xCoord || !yCoord) {
			throw new Error('Missing X or Y coordinates in COSE key')
		}

		// Ensure coordinates are Buffers
		if (!(xCoord instanceof Buffer) || !(yCoord instanceof Buffer)) {
			throw new Error('Coordinates must be Buffer objects')
		}

		// Validate coordinate lengths
		if (xCoord.length !== 32 || yCoord.length !== 32) {
			throw new Error(
				`Invalid coordinate lengths: X=${xCoord.length}, Y=${yCoord.length} (expected 32 each)`,
			)
		}

		// Construct uncompressed public key: 0x04 || X || Y
		// 0x04 indicates an uncompressed point in SEC1 format
		const uncompressedKey = Buffer.concat([
			Buffer.from([0x04]), // Uncompressed point indicator
			xCoord, // X coordinate (32 bytes)
			yCoord, // Y coordinate (32 bytes)
		])

		console.log('✅ Converted to uncompressed secp256r1 format')
		console.log('   Output length:', uncompressedKey.length, 'bytes')
		console.log('   Hex:', uncompressedKey.toString('hex'))

		if (uncompressedKey.length !== 65) {
			throw new Error(
				`Invalid uncompressed key length: ${uncompressedKey.length} (expected 65)`,
			)
		}

		return uncompressedKey
	} catch (error) {
		console.error(
			'❌ Failed to convert COSE key to uncompressed format:',
			error,
		)
		throw new Error(
			`COSE key conversion failed: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
}

/**
 * Convert uncompressed public key to base64 for storage
 *
 * @param uncompressedKey - Uncompressed public key (65 bytes)
 * @returns Base64-encoded uncompressed public key
 */
export function uncompressedKeyToBase64(uncompressedKey: Buffer): string {
	if (uncompressedKey.length !== 65) {
		throw new Error(
			`Invalid uncompressed key length: ${uncompressedKey.length} (expected 65 bytes)`,
		)
	}

	if (uncompressedKey[0] !== 0x04) {
		throw new Error(
			`Invalid uncompressed key format: first byte is 0x${uncompressedKey[0].toString(16)} (expected 0x04)`,
		)
	}

	return uncompressedKey.toString('base64')
}

/**
 * Convert base64-encoded uncompressed public key to hex
 *
 * @param base64Key - Base64-encoded uncompressed public key
 * @returns Hex-encoded uncompressed public key
 */
export function base64ToHexUncompressedKey(base64Key: string): string {
	const keyBuffer = Buffer.from(base64Key, 'base64')

	if (keyBuffer.length !== 65) {
		throw new Error(
			`Invalid key length: ${keyBuffer.length} (expected 65 bytes for uncompressed secp256r1)`,
		)
	}

	if (keyBuffer[0] !== 0x04) {
		throw new Error(
			`Invalid key format: first byte is 0x${keyBuffer[0].toString(16)} (expected 0x04)`,
		)
	}

	return keyBuffer.toString('hex')
}

/**
 * Helper to check if a public key is in COSE format or uncompressed format
 *
 * @param publicKey - Public key in any format (Buffer, Uint8Array, base64 string)
 * @returns 'cose' | 'uncompressed' | 'unknown'
 */
export function detectPublicKeyFormat(
	publicKey: Buffer | Uint8Array | string,
): 'cose' | 'uncompressed' | 'unknown' {
	try {
		let keyBuffer: Buffer
		if (typeof publicKey === 'string') {
			keyBuffer = Buffer.from(publicKey, 'base64')
		} else if (publicKey instanceof Uint8Array) {
			keyBuffer = Buffer.from(publicKey)
		} else {
			keyBuffer = publicKey
		}

		// Check for uncompressed format (65 bytes starting with 0x04)
		if (keyBuffer.length === 65 && keyBuffer[0] === 0x04) {
			return 'uncompressed'
		}

		// Try to decode as CBOR
		try {
			const decoded = CBOR.decode(keyBuffer)
			if (
				decoded &&
				typeof decoded === 'object' &&
				decoded[-2] &&
				decoded[-3]
			) {
				return 'cose'
			}
		} catch {
			// Not valid CBOR
		}

		return 'unknown'
	} catch {
		return 'unknown'
	}
}

/**
 * Compute device_id from COSE public key (for Stellar smart contracts)
 * Device ID is the SHA256 hash of the uncompressed public key
 *
 * This is computed on-demand and not stored in the database for security.
 * The COSE public key is stored in the database, and device_id is derived when needed.
 *
 * @param cosePublicKeyBase64 - Base64-encoded COSE public key from database
 * @returns 32-byte device_id as hex string
 */
export function computeDeviceIdFromCoseKey(
	cosePublicKeyBase64: string,
): string {
	// Convert COSE to uncompressed format
	const uncompressedKey = convertCoseToUncompressedPublicKey(
		Buffer.from(cosePublicKeyBase64, 'base64'),
	)

	// Hash the uncompressed key to get 32-byte device_id
	const deviceIdBytes = createHash('sha256').update(uncompressedKey).digest()

	console.log('🔑 Computed device_id from COSE public key:', {
		coseLength: cosePublicKeyBase64.length,
		uncompressedLength: uncompressedKey.length,
		deviceId: deviceIdBytes.toString('hex'),
	})

	return deviceIdBytes.toString('hex')
}
