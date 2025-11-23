// import { createHash } from 'node:crypto'

import { type Transaction, xdr } from '@stellar/stellar-sdk'
import { createHash } from 'crypto'

/**
 * Temporary salt for deriving deterministic device identifiers from WebAuthn
 * credential IDs. Replace with an environment variable when wiring secrets.
 */
export const DEFAULT_DEVICE_ID_SALT = 'kindfi-webauthn-demo'

const DEFAULT_DEVICE_ID_SALT_BUFFER = Buffer.from(
	DEFAULT_DEVICE_ID_SALT,
	'utf8',
)

/**
 * Convert a base64url string (WebAuthn default) to a Buffer.
 */
export function base64UrlToBuffer(value: string): Buffer {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
	const padLength = (4 - (normalized.length % 4)) % 4
	return Buffer.from(normalized + '='.repeat(padLength), 'base64')
}

export interface DeviceIdOptions {
	/** Optional override for the salt (Buffer or utf8 string). */
	salt?: Buffer | string
}

/**
 * Compute device_id as SHA256(salt || credential_id_bytes).
 * Matches the contract expectation that device_id derives from credential_id.
 */
export function computeDeviceIdFromCredentialId(
	credentialId: string,
	options: DeviceIdOptions = {},
): string {
	const saltBuffer = options.salt
		? Buffer.isBuffer(options.salt)
			? options.salt
			: Buffer.from(options.salt, 'utf8')
		: DEFAULT_DEVICE_ID_SALT_BUFFER

	const credentialBytes = base64UrlToBuffer(credentialId)
	return createHash('sha256')
		.update(Buffer.concat([saltBuffer, credentialBytes]))
		.digest('hex')
}

export interface SignaturePayloadResult {
	payloadHex: string
	nonce: string
	signatureExpirationLedger: string
}

/**
 * Derive Soroban signature_payload hash from an assembled transaction.
 */
export function deriveSignaturePayload({
	transaction,
	networkPassphrase,
}: {
	transaction: Transaction
	networkPassphrase: string
}): SignaturePayloadResult | null {
	// biome-ignore lint: Soroban auth entries live on the operation object
	const sorobanOp = transaction.operations[0] as any
	const authEntries = sorobanOp?.auth || []
	if (authEntries.length === 0) {
		return null
	}
	const authEntry = authEntries[0]
	if (
		authEntry.credentials().switch() !==
		xdr.SorobanCredentialsType.sorobanCredentialsAddress()
	) {
		return null
	}

	const addressCredentials = authEntry.credentials().address()
	const nonce = addressCredentials.nonce()
	const signatureExpirationLedger =
		addressCredentials.signatureExpirationLedger()
	const rootInvocation = authEntry.rootInvocation()

	const networkIdHash = createHash('sha256')
		.update(networkPassphrase, 'utf8')
		.digest()

	const sorobanAuthPreimage = new xdr.HashIdPreimageSorobanAuthorization({
		networkId: networkIdHash,
		nonce,
		signatureExpirationLedger,
		invocation: rootInvocation,
	})

	const preimage =
		xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(sorobanAuthPreimage)
	const payloadHex = createHash('sha256').update(preimage.toXDR()).digest('hex')

	return {
		payloadHex,
		nonce: nonce.toString(),
		signatureExpirationLedger: signatureExpirationLedger.toString(),
	}
}

const P256_ORDER = Buffer.from(
	'ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551',
	'hex',
)

const HALF_ORDER =
	(BigInt('0x' + P256_ORDER.toString('hex')) - BigInt(1)) / BigInt(2)

const bufferToBigint = (value: Buffer): bigint =>
	value.length === 0 ? BigInt(0) : BigInt('0x' + value.toString('hex'))

export interface WebAuthnAssertionResponse {
	id: string
	rawId?: string
	response: {
		authenticatorData: string
		clientDataJSON: string
		signature: string
	}
}

export interface WebAuthnClientDataJSON {
	type?: string
	challenge?: string
	origin?: string
	crossOrigin?: boolean
	[key: string]: unknown
}

export interface BuildWebAuthnSignatureScValParams {
	assertion: WebAuthnAssertionResponse
	deviceIdHex?: string
	deviceIdBytes?: Buffer
}

export interface BuildWebAuthnSignatureScValResult {
	signatureScVal: xdr.ScVal
	authenticatorData: Buffer
	clientDataJSON: Buffer
	clientData: WebAuthnClientDataJSON
	clientDataHash: Buffer
	webauthnPayload: Buffer
	webauthnPayloadHash: Buffer
	signature: Buffer
	deviceIdBytes: Buffer
	challenge?: string
	challengeBytes?: Buffer
}

export function convertP256SignatureAsnToCompact(sig: Buffer): Buffer {
	let offset = 0
	if (sig[offset] !== 0x30) {
		throw new Error('signature is not a sequence')
	}
	offset += 1

	const seqLen = sig[offset]
	offset += 1
	if (seqLen & 0x80) {
		const lenBytes = seqLen & 0x7f
		offset += lenBytes
	}

	if (sig[offset] !== 0x02) {
		throw new Error('first element in sequence is not an integer')
	}
	offset += 1

	const rLen = sig[offset]
	offset += 1
	const rBytes = sig.slice(offset, offset + rLen)
	offset += rLen

	if (sig[offset] !== 0x02) {
		throw new Error('second element in sequence is not an integer')
	}
	offset += 1

	const sLen = sig[offset]
	offset += 1
	const sBytes = sig.slice(offset, offset + sLen)

	offset += sLen

	const rBigInt = bufferToBigint(rBytes)
	let sBigInt = bufferToBigint(sBytes)

	const orderBigInt = bufferToBigint(P256_ORDER)
	if (sBigInt > HALF_ORDER) {
		sBigInt = orderBigInt - sBigInt
	}

	const rHex = rBigInt.toString(16).padStart(64, '0')
	const sHex = sBigInt.toString(16).padStart(64, '0')
	return Buffer.from(rHex + sHex, 'hex')
}

export function buildWebAuthnSignatureScVal({
	assertion,
	deviceIdHex,
	deviceIdBytes,
}: BuildWebAuthnSignatureScValParams): BuildWebAuthnSignatureScValResult {
	const authenticatorData = base64UrlToBuffer(
		assertion.response.authenticatorData,
	)
	const clientDataJSON = base64UrlToBuffer(assertion.response.clientDataJSON)
	const derSignature = base64UrlToBuffer(assertion.response.signature)
	const signature = convertP256SignatureAsnToCompact(derSignature)

	const resolvedDeviceId = deviceIdBytes
		? Buffer.from(deviceIdBytes)
		: deviceIdHex
			? Buffer.from(deviceIdHex, 'hex')
			: null

	if (!resolvedDeviceId) {
		throw new Error('deviceIdBytes or deviceIdHex is required')
	}

	if (resolvedDeviceId.length !== 32) {
		throw new Error('device ID must be 32 bytes')
	}

	if (signature.length !== 64) {
		throw new Error('signature must be 64 bytes after conversion')
	}

	const parsedClientData = JSON.parse(
		clientDataJSON.toString('utf8'),
	) as WebAuthnClientDataJSON
	const clientDataHash = createHash('sha256').update(clientDataJSON).digest()
	const webauthnPayload = Buffer.concat([authenticatorData, clientDataHash])
	const webauthnPayloadHash = createHash('sha256')
		.update(webauthnPayload)
		.digest()

	const challenge =
		typeof parsedClientData.challenge === 'string'
			? parsedClientData.challenge
			: undefined
	const challengeBytes = challenge ? base64UrlToBuffer(challenge) : undefined

	const signatureScVal = xdr.ScVal.scvMap([
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('authenticator_data'),
			val: xdr.ScVal.scvBytes(authenticatorData),
		}),
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('client_data_json'),
			val: xdr.ScVal.scvBytes(clientDataJSON),
		}),
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('device_id'),
			val: xdr.ScVal.scvBytes(resolvedDeviceId),
		}),
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('signature'),
			val: xdr.ScVal.scvBytes(signature),
		}),
	])

	return {
		signatureScVal,
		authenticatorData,
		clientDataJSON,
		clientData: parsedClientData,
		clientDataHash,
		webauthnPayload,
		webauthnPayloadHash,
		signature,
		deviceIdBytes: resolvedDeviceId,
		challenge,
		challengeBytes,
	}
}
