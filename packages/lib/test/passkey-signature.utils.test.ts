import { describe, expect, test } from 'bun:test'
import { Buffer } from 'node:buffer'
import { createHash, createSign, generateKeyPairSync } from 'node:crypto'
import {
	convertUncompressedToDER,
	verifySECP256R1Signature,
} from '../src/stellar/passkey-signature.utils'

describe('convertUncompressedToDER', () => {
	test('prepends the 26-byte P-256 SPKI prefix and appends the key', () => {
		const key = Buffer.alloc(65, 0x04)
		const der = convertUncompressedToDER(key)
		expect(der.length).toBe(26 + 65)
		expect(der[0]).toBe(0x30)
		expect(der[1]).toBe(0x59)
		expect(der.subarray(26)).toEqual(key)
	})
})

describe('verifySECP256R1Signature', () => {
	const { privateKey, publicKey } = generateKeyPairSync('ec', {
		namedCurve: 'prime256v1',
	})
	// P-256 SPKI DER = 26-byte prefix + 65-byte uncompressed point.
	const spkiDer = publicKey.export({ type: 'spki', format: 'der' }) as Buffer
	const uncompressedKey = spkiDer.subarray(spkiDer.length - 65)

	const authenticatorData = Buffer.from('authenticator-data').toString('base64')
	const clientDataJSON = Buffer.from(
		JSON.stringify({ challenge: 'abc', origin: 'https://kindfi.org' }),
	).toString('base64')

	const sign = (auth: string, client: string): string => {
		const authBuf = Buffer.from(auth, 'base64')
		const clientHash = createHash('sha256').update(Buffer.from(client, 'base64')).digest()
		const signedData = Buffer.concat([authBuf, clientHash])
		const signer = createSign('SHA256')
		signer.update(signedData)
		return signer.sign(privateKey).toString('base64')
	}

	test('returns true for a valid signature', async () => {
		const signature = sign(authenticatorData, clientDataJSON)
		const result = await verifySECP256R1Signature(
			authenticatorData,
			clientDataJSON,
			signature,
			uncompressedKey,
		)
		expect(result).toBe(true)
	})

	test('returns false when the signed client data differs', async () => {
		const signature = sign(authenticatorData, clientDataJSON)
		const otherClient = Buffer.from(JSON.stringify({ challenge: 'different' })).toString('base64')
		const result = await verifySECP256R1Signature(
			authenticatorData,
			otherClient,
			signature,
			uncompressedKey,
		)
		expect(result).toBe(false)
	})

	test('returns false for a malformed signature', async () => {
		const result = await verifySECP256R1Signature(
			authenticatorData,
			clientDataJSON,
			Buffer.from('not-a-signature').toString('base64'),
			uncompressedKey,
		)
		expect(result).toBe(false)
	})
})
