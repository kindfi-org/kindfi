import { z } from 'zod'

export const createContributionSchema = z.object({
	projectId: z.string().uuid().optional(),
	contractId: z.string().optional(),
	amount: z.coerce.number().positive('Amount must be positive'),
	transactionHash: z.string().optional(),
}).refine(
	(data) => data.projectId || data.contractId,
	{ message: 'Either projectId or contractId is required', path: ['projectId'] },
)

export const syncContributionSchema = z.object({
	contractId: z.string().optional(),
	projectId: z.string().uuid().optional(),
	amount: z.coerce.number().positive('Amount must be positive'),
}).refine(
	(data) => data.contractId || data.projectId,
	{
		message: 'Either contractId or projectId is required',
		path: ['contractId'],
	},
)
