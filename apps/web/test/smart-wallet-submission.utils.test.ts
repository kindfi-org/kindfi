import { describe, expect, test } from 'bun:test'
import { submitTransactionWithWebAuthn } from '../lib/stellar/smart-wallet-submission.utils'

describe('submitTransactionWithWebAuthn', () => {
	test('throws a helpful error directing to Smart Account Kit', async () => {
		await expect(
			submitTransactionWithWebAuthn({
				smartWalletAddress: 'C...',
				operation: {} as never,
				webAuthnSignature: {} as never,
				publicKey: new Uint8Array(),
			}),
		).rejects.toThrow('Smart Account Kit')
	})
})
