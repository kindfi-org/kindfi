import { describe, expect, test } from 'bun:test'

// ✅ Must be at top level, before ANY imports or dynamic imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
process.env.NEXT_PUBLIC_KYC_API_BASE_URL = 'http://localhost:3001'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

describe('Etherfuse schema validation', () => {
	test('etherfuseDepositRequestSchema validates correct data', async () => {
		const { etherfuseDepositRequestSchema } = await import('../lib/schemas/etherfuse.schemas')

		const validData = {
			userId: 'user-123',
			amount: '100.50',
			currency: 'MXN',
			targetAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
			walletAddress: 'GABCD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
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
			targetAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
			walletAddress: 'GABCD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
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
			sourceAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
			currency: 'MXN',
			bankAccountId: 'bank-acc-123',
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
			sourceAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
			currency: 'MXN',
			bankAccountId: 'bank-acc-123',
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
				targetAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
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
				targetAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
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
				targetAsset: 'USDC:GA5ZSEJYB37JRC5AVCY5MV7R3ZR3WUYCBK6R3A3D3Q3D3Q3D3Q3D3Q3D',
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
			bankAccountId: 'bank-acc-123',
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
			bankAccountId: 'bank-acc-123',
			cryptoWalletId: 'wallet-123',
			quoteId: '123e4567-e89b-12d3-a456-426614174001',
		}

		const result = etherfuseOrderRequestSchema.safeParse(invalidData)
		expect(result.success).toBe(false)
	})
})
