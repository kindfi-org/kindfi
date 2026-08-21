import { describe, expect, test } from 'bun:test'
import { Asset, Keypair } from '@stellar/stellar-sdk'
import { TESTNET_USDC_TRUSTLINE_ADDRESS } from '~/lib/constants/escrow'
import { buildPaymentTransaction } from '~/lib/wallet-send/transaction/build-payment'
import { verifyPaymentTransactionXdr } from '~/lib/wallet-send/transaction/verify-payment-xdr'
import type { HorizonAccountResponse } from '~/lib/wallet-send/types'

describe('wallet send transaction', () => {
	test('builds and verifies a native payment XDR', () => {
		const sourceKeypair = Keypair.random()
		const destination = Keypair.random().publicKey()
		const sourceAccount: HorizonAccountResponse = {
			id: sourceKeypair.publicKey(),
			account_id: sourceKeypair.publicKey(),
			sequence: '1',
			subentry_count: 0,
			balances: [{ asset_type: 'native', balance: '100' }],
		}

		const payment = {
			destination,
			amount: '10',
			memo: { type: 'none' as const },
			asset: 'XLM' as const,
			paymentAsset: Asset.native(),
		}

		const config = {
			networkId: 'testnet' as const,
			networkPassphrase: 'Test SDF Network ; September 2015',
			horizonUrl: 'https://horizon-testnet.stellar.org',
			usdc: { code: 'USDC' as const, issuer: TESTNET_USDC_TRUSTLINE_ADDRESS },
			explorerNetwork: 'testnet' as const,
		}

		const built = buildPaymentTransaction(sourceAccount, payment, config)
		expect(() =>
			verifyPaymentTransactionXdr(built.unsignedXdr, sourceAccount.account_id, payment, config),
		).not.toThrow()
	})
})
