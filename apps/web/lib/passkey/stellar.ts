import type {
	AuthenticationResponseJSON,
	RegistrationResponseJSON,
} from '@simplewebauthn/browser'
import { hash } from '@stellar/stellar-sdk'
import base64url from 'base64url'
import { bigintToBuf, bufToBigint } from 'bigint-conversion'
import * as CBOR from 'cbor-x/decode'

export const truncateAccount = (account: string) => {
	return `${account.slice(0, 5)}...${account.slice(-5)}`
}

const getPublicKeyObject = (attestationObject: string) => {
	const { authData } = CBOR.decode(base64url.toBuffer(attestationObject))
	const authDataUint8Array = new Uint8Array(authData)
	const authDataView = new DataView(
		authDataUint8Array.buffer,
		0,
		authDataUint8Array.length,
	)

	let offset = 0

	// RP ID Hash (32 bytes)
	const rpIdHash = authData.slice(offset, offset + 32)
	offset += 32

	// Flags (1 byte)
	const flags = authDataView.getUint8(offset)
	offset += 1

	// Sign Count (4 bytes, big endian)
	const signCount = authDataView.getUint32(offset, false)
	offset += 4

	// Attested Credential Data, if present
	if (flags & 0x40) {
		// Checking the AT flag
		// AAGUID (16 bytes)
		const aaguid = authData.slice(offset, offset + 16)
		offset += 16

		// Credential ID Length (2 bytes, big endian)
		const credIdLength = authDataView.getUint16(offset, false)
		offset += 2

		// Credential ID (variable length)
		const credentialId = authData.slice(offset, offset + credIdLength)
		offset += credIdLength

		// Credential Public Key - (77 bytes...I hope)
		const credentialPublicKey = authData.slice(offset, offset + 77)
		offset += 77

		// Any leftover bytes. I found some when using a YubiKey
		const theRest = authData.slice(offset)

		// Decode the credential public key to COSE
		const publicKeyObject = new Map<string, unknown>(
			Object.entries(CBOR.decode(credentialPublicKey)),
		)

		return {
			rpIdHash,
			flags,
			signCount,
			aaguid,
			credIdLength,
			credentialId,
			credentialPublicKey,
			theRest,
			publicKeyObject,
		}
	}

	throw new Error('Attested credential data not present in the flags.')
}

export const getPublicKeys = async (
	registration: RegistrationResponseJSON | AuthenticationResponseJSON,
) => {
	const contractSalt = hash(base64url.toBuffer(registration.id))

	if ('attestationObject' in registration.response) {
		// Handle RegistrationResponseJSON
		const { publicKeyObject, aaguid } = getPublicKeyObject(
			registration.response.attestationObject,
		)
		const publicKey = Buffer.from([
			4, // (0x04 prefix) https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm
			...(publicKeyObject.get('-2') as Buffer),
			...(publicKeyObject.get('-3') as Buffer),
		])

		return {
			contractSalt,
			publicKey,
			aaguid: base64url.encode(aaguid),
		}
	}
	return {
		contractSalt,
	}
}

export const convertEcdsaSignatureAsnToCompact = (sig: Buffer) => {
	// Define the order of the curve secp256k1
	// https://github.com/RustCrypto/elliptic-curves/blob/master/p256/src/lib.rs#L72
	const q = Buffer.from(
		'ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551',
		'hex',
	)

	// ASN Sequence
	let offset = 0
	if (sig[offset] !== 0x30) {
		throw 'signature is not a sequence'
	}
	offset += 1

	// ASN Sequence Byte Length
	offset += 1

	// ASN Integer (R)
	if (sig[offset] !== 0x02) {
		throw 'first element in sequence is not an integer'
	}
	offset += 1

	// ASN Integer (R) Byte Length
	const rLen = sig[offset]
	offset += 1

	// ASN Integer (R) Byte Value
	if (rLen >= 33) {
		if (rLen !== 33 || sig[offset] !== 0x00) {
			throw "can only handle larger than 32 byte R's that are len 33 and lead with zero"
		}
		offset += 1
	}
	const r = sig.slice(offset, offset + 32)
	offset += 32

	// ASN Integer (S)
	if (sig[offset] !== 0x02) {
		throw 'second element in sequence is not an integer'
	}
	offset += 1

	// ASN Integer (S) Byte Length
	const sLen = sig[offset]
	offset += 1

	// ASN Integer (S) Byte Value
	if (sLen >= 33) {
		if (sLen !== 33 || sig[offset] !== 0x00) {
			throw "can only handle larger than 32 byte R's that are len 33 and lead with zero"
		}
		offset += 1
	}

	const s = sig.slice(offset, offset + 32)

	offset += 32

	let signature64: Buffer

	// Force low S range
	// https://github.com/stellar/stellar-protocol/discussions/1435#discussioncomment-8809175
	// https://discord.com/channels/897514728459468821/1233048618571927693
	if (bufToBigint(s) > (bufToBigint(q) - BigInt(1)) / BigInt(2)) {
		signature64 = Buffer.from([
			...r,
			...Buffer.from(
				new Uint8Array(bigintToBuf(bufToBigint(q) - bufToBigint(s))),
			),
		])
	} else {
		signature64 = Buffer.from([...r, ...s])
	}

	return signature64
}
