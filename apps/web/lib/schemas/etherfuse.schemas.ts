import { z } from 'zod'

// Supported blockchains
export const etherfuseBlockchainSchema = z.enum(['stellar', 'solana', 'base', 'polygon', 'monad'])

// Ramp type
export const etherfuseRampTypeSchema = z.enum(['onramp', 'offramp'])

// Asset identifier format based on blockchain
export const etherfuseAssetIdentifierSchema = z.string().min(1, 'Asset identifier is required')

// Quote assets schema
export const etherfuseQuoteAssetsSchema = z.object({
	type: etherfuseRampTypeSchema,
	sourceAsset: z.string().min(1, 'Source asset is required'),
	targetAsset: etherfuseAssetIdentifierSchema,
})

// Quote request schema
export const etherfuseQuoteRequestSchema = z.object({
	quoteId: z.string().uuid('Invalid quote ID format'),
	customerId: z.string().min(1, 'Customer ID is required'),
	blockchain: etherfuseBlockchainSchema,
	quoteAssets: etherfuseQuoteAssetsSchema,
	sourceAmount: z.string().min(1, 'Source amount is required'),
	partnerFeeBps: z.number().int().min(0).max(10000).optional(),
})

// Quote response schema
export const etherfuseQuoteResponseSchema = z.object({
	quoteId: z.string().uuid(),
	sourceAmount: z.string(),
	targetAmount: z.string(),
	sourceAsset: z.string(),
	targetAsset: z.string(),
	exchangeRate: z.string(),
	feeAmount: z.string(),
	totalAmount: z.string(),
	validUntil: z.string(),
})

// Order creation request schema
export const etherfuseOrderRequestSchema = z.object({
	orderId: z.string().uuid('Invalid order ID format'),
	bankAccountId: z.string().min(1, 'Bank account ID is required'),
	cryptoWalletId: z.string().min(1, 'Crypto wallet ID is required'),
	quoteId: z.string().uuid('Invalid quote ID format'),
})

// Order response schema
export const etherfuseOrderResponseSchema = z.object({
	orderId: z.string().uuid(),
	quoteId: z.string().uuid(),
	status: z.enum(['created', 'funded', 'completed', 'failed', 'cancelled']),
	sourceAmount: z.string(),
	targetAmount: z.string(),
	sourceAsset: z.string(),
	targetAsset: z.string(),
	depositClabe: z.string().optional(),
	depositBankName: z.string().optional(),
	depositAccountHolder: z.string().optional(),
	burnTransaction: z.string().optional(),
	statusPage: z.string().url(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

// Asset listing response schema
export const etherfuseAssetSchema = z.object({
	identifier: z.string(),
	symbol: z.string(),
	name: z.string(),
	decimals: z.number(),
	blockchain: etherfuseBlockchainSchema,
	isStablebond: z.boolean().optional(),
})

export const etherfuseAssetsResponseSchema = z.object({
	assets: z.array(etherfuseAssetSchema),
})

// On-ramp specific request with wallet address for Stellar
export const etherfuseOnRampRequestSchema = etherfuseQuoteRequestSchema.extend({
	quoteAssets: etherfuseQuoteAssetsSchema.extend({
		type: z.literal('onramp'),
	}),
	walletAddress: z.string().min(1, 'Wallet address is required').optional(),
})

// Off-ramp specific request
export const etherfuseOffRampRequestSchema = etherfuseQuoteRequestSchema.extend({
	quoteAssets: etherfuseQuoteAssetsSchema.extend({
		type: z.literal('offramp'),
	}),
})

// Fiat received simulation (sandbox only)
export const etherfuseFiatReceivedSchema = z.object({
	orderId: z.string().uuid('Invalid order ID format'),
	amount: z.string().min(1, 'Amount is required'),
})

// Webhook event types
export const etherfuseWebhookEventTypeSchema = z.enum([
	'order_created',
	'order_updated',
	'order_completed',
	'order_failed',
])

// Webhook payload schema
export const etherfuseWebhookSchema = z.object({
	eventType: etherfuseWebhookEventTypeSchema,
	orderId: z.string().uuid(),
	timestamp: z.string(),
	data: z.object({
		order: etherfuseOrderResponseSchema.partial(),
	}),
})

// KindFi-specific schemas for integration

// On-ramp deposit request (user-facing)
export const etherfuseDepositRequestSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	amount: z
		.string()
		.min(1, 'Amount is required')
		.refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
			message: 'Amount must be a positive number',
		}),
	currency: z.string().default('MXN'),
	targetAsset: z.string().min(1, 'Target asset is required'),
	walletAddress: z.string().min(1, 'Wallet address is required'),
	escrowId: z.string().optional(),
})

// Off-ramp withdrawal request (user-facing)
export const etherfuseWithdrawalRequestSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	amount: z
		.string()
		.min(1, 'Amount is required')
		.refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
			message: 'Amount must be a positive number',
		}),
	sourceAsset: z.string().min(1, 'Source asset is required'),
	currency: z.string().default('MXN'),
	bankAccountId: z.string().min(1, 'Bank account ID is required'),
	escrowId: z.string().optional(),
})

// Response schemas for KindFi API
export const etherfuseDepositResponseSchema = z.object({
	success: z.boolean(),
	quoteId: z.string().uuid().optional(),
	orderId: z.string().uuid().optional(),
	statusPage: z.string().url().optional(),
	message: z.string(),
	error: z.string().optional(),
})

export const etherfuseWithdrawalResponseSchema = z.object({
	success: z.boolean(),
	quoteId: z.string().uuid().optional(),
	orderId: z.string().uuid().optional(),
	burnTransaction: z.string().optional(),
	statusPage: z.string().url().optional(),
	message: z.string(),
	error: z.string().optional(),
})

// Order status check response
export const etherfuseOrderStatusResponseSchema = z.object({
	orderId: z.string().uuid(),
	status: z.enum([
		'created',
		'funded',
		'completed',
		'failed',
		'cancelled',
		'fiat_received',
		'finalized',
	]),
	sourceAmount: z.string(),
	targetAmount: z.string(),
	sourceAsset: z.string(),
	targetAsset: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	completedAt: z.string().optional(),
})
