import { STELLAR_G_ADDRESS_REGEX } from '@packages/lib/utils/wallet-address'
import { z } from 'zod'

export const createContributionSchema = z
	.object({
		projectId: z.string().uuid().optional(),
		contractId: z.string().optional(),
		amount: z.coerce.number().positive('Amount must be positive'),
		transactionHash: z.string().optional(),
		walletAddress: z
			.string()
			.regex(STELLAR_G_ADDRESS_REGEX, 'Must be a valid external Stellar wallet address (G-address)')
			.optional(),
	})
	.refine((data) => data.projectId || data.contractId, {
		message: 'Either projectId or contractId is required',
		path: ['projectId'],
	})

export const syncContributionSchema = z
	.object({
		contractId: z.string().optional(),
		projectId: z.string().uuid().optional(),
		amount: z.coerce.number().positive('Amount must be positive'),
	})
	.refine((data) => data.contractId || data.projectId, {
		message: 'Either contractId or projectId is required',
		path: ['contractId'],
	})
