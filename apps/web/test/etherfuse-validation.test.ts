import { describe, expect, test } from 'bun:test'

// ✅ Must be at top level, before ANY imports or dynamic imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
process.env.NEXT_PUBLIC_KYC_API_BASE_URL = 'http://localhost:3001'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

const VALID_G_ADDRESS = 'GDUKMGUGD3V6VXTU2RLAUM7A2FABLMHCPWTMDHKP7HHJ6FCZKEY4PVWL'
const VALID_BANK_ACCOUNT_ID = 'd86c8445-359c-421d-a66d-4e08f916fcc9'

describe('Etherfuse onboarding status', () => {
	test('isApprovedEtherfuseKycStatus accepts approved only', async () => {
		const { isApprovedEtherfuseKycStatus } = await import('../lib/etherfuse/resolve-order-context')

		expect(isApprovedEtherfuseKycStatus('approved')).toBe(true)
		expect(isApprovedEtherfuseKycStatus('Approved')).toBe(true)
		expect(isApprovedEtherfuseKycStatus('not_started')).toBe(false)
		expect(isApprovedEtherfuseKycStatus(null)).toBe(false)
	})

	test('hostUiMismatch when bank compliant but KYC not_started', async () => {
		const { computeEtherfuseOnboardingSnapshot } = await import(
			'../lib/etherfuse/resolve-order-context'
		)

		const snapshot = computeEtherfuseOnboardingSnapshot({
			kycStatus: 'not_started',
			walletKycStatus: 'not_started',
			bankAccountCompliant: true,
			hasBankAccount: true,
		})

		expect(snapshot.pendingSteps).toContain('identity_and_agreements')
		expect(snapshot.pendingSteps).toContain('wallet_verification')
		expect(snapshot.isReady).toBe(false)
		expect(snapshot.hostUiMismatch).toBe(true)
	})

	test('isReady when customer approved, wallet kyc null, bank compliant', async () => {
		const { computeEtherfuseOnboardingSnapshot } = await import(
			'../lib/etherfuse/resolve-order-context'
		)

		const snapshot = computeEtherfuseOnboardingSnapshot({
			kycStatus: 'approved',
			walletKycStatus: null,
			bankAccountCompliant: true,
			hasBankAccount: true,
		})

		expect(snapshot.isReady).toBe(true)
	})
})

describe('Etherfuse onboarding resolution', () => {
	test('parseExistingEtherfuseOrgId extracts org id from duplicate address error', async () => {
		const { parseExistingEtherfuseOrgId } = await import(
			'../lib/etherfuse/resolve-etherfuse-onboarding'
		)

		expect(
			parseExistingEtherfuseOrgId(
				'You have already added user with this address, see org: d604b8ac-5443-45e6-a119-c981e9064a15',
			),
		).toBe('d604b8ac-5443-45e6-a119-c981e9064a15')
	})

	test('isEtherfuseClientNotLinkedError detects org link failures', async () => {
		const { isEtherfuseClientNotLinkedError } = await import('../lib/etherfuse/order-errors')

		expect(
			isEtherfuseClientNotLinkedError(
				'Etherfuse API error (/ramp/onboarding-url): Client not linked to this organization',
			),
		).toBe(true)
	})
})

describe('Etherfuse schema validation', () => {
	test('etherfuseDepositRequestSchema validates correct data', async () => {
		const { etherfuseDepositRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const validData = {
			userId: 'user-123',
			amount: '100.50',
			currency: 'MXN',
			targetAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			walletAddress: VALID_G_ADDRESS,
			escrowId: 'escrow-456',
		}

		const result = etherfuseDepositRequestSchema.safeParse(validData)
		expect(result.success).toBe(true)
	})

	test('etherfuseDepositRequestSchema rejects invalid amount', async () => {
		const { etherfuseDepositRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const invalidData = {
			userId: 'user-123',
			amount: '-50',
			currency: 'MXN',
			targetAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			walletAddress: VALID_G_ADDRESS,
		}

		const result = etherfuseDepositRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})

	test('etherfuseDepositRequestSchema rejects missing required fields', async () => {
		const { etherfuseDepositRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const invalidData = {
			userId: 'user-123',
			amount: '100',
		}

		const result = etherfuseDepositRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})

	test('etherfuseWithdrawalRequestSchema validates correct data', async () => {
		const { etherfuseWithdrawalRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const validData = {
			userId: 'user-123',
			amount: '50.00',
			sourceAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			currency: 'MXN',
			bankAccountId: VALID_BANK_ACCOUNT_ID,
			walletAddress: VALID_G_ADDRESS,
			escrowId: 'escrow-456',
		}

		const result = etherfuseWithdrawalRequestSchema.safeParse(validData)
		expect(result.success).toBe(true)
	})

	test('etherfuseWithdrawalRequestSchema rejects invalid amount', async () => {
		const { etherfuseWithdrawalRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const invalidData = {
			userId: 'user-123',
			amount: '0',
			sourceAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			currency: 'MXN',
			bankAccountId: VALID_BANK_ACCOUNT_ID,
			walletAddress: VALID_G_ADDRESS,
		}

		const result = etherfuseWithdrawalRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})

	test('etherfuseDepositRequestSchema rejects smart account addresses', async () => {
		const { etherfuseDepositRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const invalidData = {
			userId: 'user-123',
			amount: '100',
			currency: 'MXN',
			targetAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			walletAddress: 'CCW3NPIK5DJU2HE3U3AXLFF2HZ3OFOOB7PFNAACDYYLOA4ZWG42QUHUD',
		}

		const result = etherfuseDepositRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})

	test('etherfuseWithdrawalRequestSchema rejects unsupported fiat currency', async () => {
		const { etherfuseWithdrawalRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const invalidData = {
			userId: 'user-123',
			amount: '50',
			sourceAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			currency: 'USD',
			bankAccountId: VALID_BANK_ACCOUNT_ID,
			walletAddress: VALID_G_ADDRESS,
		}

		const result = etherfuseWithdrawalRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})

	test('etherfuseQuoteRequestSchema validates correct quote data', async () => {
		const { etherfuseQuoteRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const validData = {
			quoteId: '123e4567-e89b-12d3-a456-426614174000',
			customerId: 'customer-123',
			blockchain: 'stellar',
			quoteAssets: {
				type: 'onramp',
				sourceAsset: 'MXN',
				targetAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			},
			sourceAmount: '100',
		}

		const result = etherfuseQuoteRequestSchema.safeParse(validData)
		expect(result.success).toBe(true)
	})

	test('etherfuseQuoteRequestSchema rejects invalid UUID', async () => {
		const { etherfuseQuoteRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const invalidData = {
			quoteId: 'not-a-uuid',
			customerId: 'customer-123',
			blockchain: 'stellar',
			quoteAssets: {
				type: 'onramp',
				sourceAsset: 'MXN',
				targetAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			},
			sourceAmount: '100',
		}

		const result = etherfuseQuoteRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})

	test('etherfuseQuoteRequestSchema rejects invalid blockchain', async () => {
		const { etherfuseQuoteRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const invalidData = {
			quoteId: '123e4567-e89b-12d3-a456-426614174000',
			customerId: 'customer-123',
			blockchain: 'invalid-chain',
			quoteAssets: {
				type: 'onramp',
				sourceAsset: 'MXN',
				targetAsset: 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
			},
			sourceAmount: '100',
		}

		const result = etherfuseQuoteRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})

	test('etherfuseOrderRequestSchema validates correct order data', async () => {
		const { etherfuseOrderRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const validData = {
			orderId: '123e4567-e89b-12d3-a456-426614174000',
			bankAccountId: VALID_BANK_ACCOUNT_ID,
			cryptoWalletId: 'wallet-123',
			quoteId: '123e4567-e89b-12d3-a456-426614174001',
		}

		const result = etherfuseOrderRequestSchema.safeParse(validData)
		expect(result.success).toBe(true)
	})

	test('etherfuseOrderRequestSchema rejects invalid order UUID', async () => {
		const { etherfuseOrderRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const invalidData = {
			orderId: 'not-a-uuid',
			bankAccountId: VALID_BANK_ACCOUNT_ID,
			cryptoWalletId: 'wallet-123',
			quoteId: '123e4567-e89b-12d3-a456-426614174001',
		}

		const result = etherfuseOrderRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})
})
