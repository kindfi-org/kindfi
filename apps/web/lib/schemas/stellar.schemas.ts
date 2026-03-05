import { z } from 'zod'

export const faucetSchema = z.object({
	address: z.string().min(1, 'Address is required'),
	amount: z.coerce.number().min(0.01).max(100),
})

export const transferPrepareSchema = z.object({
	from: z.string().min(1, 'From address is required'),
	to: z.string().min(1, 'To address is required'),
	amount: z.coerce.number().positive('Amount must be positive'),
	asset: z.string().optional(),
	sponsorFees: z.boolean().optional().default(false),
})

export const accountInfoQuerySchema = z.object({
	address: z.string().min(1, 'Address is required'),
})

export const devicesSchema = z.object({
	address: z.string().min(1, 'Address is required'),
	operation: z.string().min(1, 'Operation is required'),
	signature: z.string().min(1, 'Signature is required'),
})

export const accountApproveSchema = z.object({
	accountAddress: z.string().min(1, 'Account address is required'),
})

export const contractInvokeSchema = z.object({
	from: z.string().min(1, 'From address is required'),
	contractAddress: z.string().min(1, 'Contract address is required'),
	functionName: z.string().min(1, 'Function name is required'),
	args: z.array(z.unknown()).optional().default([]),
	sponsorFees: z.boolean().optional().default(false),
})

export const addressParamSchema = z.object({
	address: z.string().min(1, 'Address is required'),
})

export const transferSubmitSchema = z.object({
	transactionData: z.object({
		transactionXDR: z.string().min(1, 'Transaction XDR is required'),
		hash: z.string().optional(),
	}),
	authResponse: z.any(),
	userDevice: z.object({
		address: z.string().min(1, 'Smart wallet address is required'),
		credential_id: z.string().optional(),
	}).passthrough(),
	verificationJSON: z.object({
		device: z.object({
			pubKey: z.unknown().refine((v) => v != null, 'Public key is required'),
		}).passthrough(),
	}).passthrough(),
})
