// import { createHash } from 'node:crypto'

import { xdr } from '@stellar/stellar-sdk'
import type { Api } from '@stellar/stellar-sdk/rpc'
import { createHash } from 'crypto'
import isEqual from 'lodash/isEqual'
import { computeDeviceIdFromCoseKey } from './webauthn-keys'

const P256_ORDER = Buffer.from(
	'ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551',
	'hex',
)

const HALF_ORDER =
	(BigInt('0x' + P256_ORDER.toString('hex')) - BigInt(1)) / BigInt(2)

export function buildWebAuthnSignatureScVal({
	assertion,
	userDevice,
}: BuildWebAuthnSignatureScValParams): BuildWebAuthnSignatureScValResult {
	const authenticatorData = base64UrlToBuffer(
		assertion.response.authenticatorData,
	)
	const clientDataJSON = base64UrlToBuffer(assertion.response.clientDataJSON)
	const derSignature = base64UrlToBuffer(assertion.response.signature)
	const signature = convertP256SignatureAsnToCompact(derSignature)
	// const contractSalt = hash(Buffer.from(userDevice.credential_id, 'base64'))
	const deviceIdHex = computeDeviceIdFromCoseKey(userDevice.public_key)
	const deviceId = Buffer.from(deviceIdHex, 'hex')

	console.log('deviceId hex', deviceId.toString('hex'))

	if (signature.length !== 64) {
		throw new Error('signature must be 64 bytes after conversion')
	}

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
			val: xdr.ScVal.scvBytes(deviceId),
		}),
		new xdr.ScMapEntry({
			key: xdr.ScVal.scvSymbol('signature'),
			val: xdr.ScVal.scvBytes(signature),
		}),
	])

	return {
		signatureScVal,
		// authenticatorData,
		// clientDataJSON,
		// clientData: parsedClientData,
		// clientDataHash,
		// webauthnPayload,
		// webauthnPayloadHash,
		// signature,
		// deviceIdBytes: deviceId,
		// challenge,
		// challengeBytes,
	}
}

/**
 * Derive Soroban signature_payload hash from an assembled transaction.
 */
export function deriveSignaturePayload({
	transactionResult,
	networkPassphrase,
}: {
	transactionResult: Api.SimulateHostFunctionResult
	networkPassphrase: string
}): SignaturePayloadResult | null {
	const authEntries = transactionResult.auth
	if (!authEntries.length) {
		return null
	}
	const authEntry = authEntries[0]
	// ? Since both are Sets, they aren't necessary equal by passing the entire Set, we need to make a copy to compare them properly
	const isSameCredentialMapping = isEqual(
		{ ...authEntry.credentials().switch() },
		{ ...xdr.SorobanCredentialsType.sorobanCredentialsAddress() },
	)
	if (!isSameCredentialMapping) {
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
	const rBytes = sig.subarray(offset, offset + rLen)
	offset += rLen

	if (sig[offset] !== 0x02) {
		throw new Error('second element in sequence is not an integer')
	}
	offset += 1

	const sLen = sig[offset]
	offset += 1
	const sBytes = sig.subarray(offset, offset + sLen)

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

/**
 * Convert a base64url string (WebAuthn default) to a Buffer.
 */
export function base64UrlToBuffer(value: string): Buffer {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
	const padLength = (4 - (normalized.length % 4)) % 4
	return Buffer.from(normalized + '='.repeat(padLength), 'base64')
}

function bufferToBigint(value: Buffer): bigint {
	return value.length === 0 ? BigInt(0) : BigInt(`0x${value.toString('hex')}`)
}

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
	userDevice: {
		address: string
		public_key: string
		credential_id: string
	}
}

export interface BuildWebAuthnSignatureScValResult {
	signatureScVal: xdr.ScVal
	// authenticatorData: Buffer
	// clientDataJSON: Buffer
	// clientData: WebAuthnClientDataJSON
	// clientDataHash: Buffer
	// webauthnPayload: Buffer
	// webauthnPayloadHash: Buffer
	// signature: Buffer
	// deviceIdBytes: Buffer
	// challenge?: string
	// challengeBytes?: Buffer
}

export interface DeviceIdOptions {
	/** Optional override for the salt (Buffer or utf8 string). */
	salt?: Buffer | string
}

export interface SignaturePayloadResult {
	payloadHex: string
	nonce: string
	signatureExpirationLedger: string
}
