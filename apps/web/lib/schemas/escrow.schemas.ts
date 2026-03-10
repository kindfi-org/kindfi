import { z } from 'zod'

const milestoneSchema = z.object({
	description: z.string().min(1, 'Milestone description is required'),
	status: z.string().optional(),
	flag: z.boolean().optional(),
})

export const escrowInitializeSchema = z.object({
	approver: z.string().min(1, 'Approver address is required'),
	serviceProvider: z.string().min(1, 'Service provider address is required'),
	milestones: z
		.array(milestoneSchema)
		.min(1, 'At least one milestone is required'),
	platformFee: z
		.number()
		.min(0, 'Platform fee must be at least 0')
		.max(100, 'Platform fee must be at most 100'),
	engagementId: z.string().min(1, 'Engagement type is required'),
})

const transactionTypeSchema = z.enum([
	'DEPOSIT',
	'RELEASE',
	'REFUND',
	'DISPUTE',
	'FEE',
])

const escrowTransactionMetadataSchema = z.object({
	escrowId: z.string().min(1, 'Escrow ID is required'),
	recipientAddress: z.string().optional(),
	reason: z.string().optional(),
	feeAmount: z.string().optional(),
	payerAddress: z.string().min(1, 'Payer address is required'),
	referenceId: z.string().optional(),
	createdAt: z.string(),
	additionalData: z.record(z.string()).optional(),
})

export const escrowFundSchema = z
	.object({
		signer: z.string().min(1, 'Signer is required'),
		fundParams: z.object({
			userId: z.string().min(1, 'User ID is required'),
			amount: z
				.string()
				.min(1, 'Amount is required')
				.refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
					message: 'Amount must be a positive number',
				}),
			transactionType: transactionTypeSchema,
			escrowContract: z.string().min(1, 'Escrow contract is required'),
		}),
		metadata: escrowTransactionMetadataSchema,
	})
	.superRefine((data, ctx) => {
		if (data.fundParams.transactionType === 'RELEASE') {
			if (!data.metadata.recipientAddress?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Recipient address is required for RELEASE transactions',
					path: ['metadata', 'recipientAddress'],
				})
			}
		}
		if (['DISPUTE', 'REFUND'].includes(data.fundParams.transactionType)) {
			if (!data.metadata.reason?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Reason is required for ${data.fundParams.transactionType} transactions`,
					path: ['metadata', 'reason'],
				})
			}
		}
		if (data.fundParams.transactionType === 'FEE') {
			if (
				!data.metadata.feeAmount ||
				Number.isNaN(Number(data.metadata.feeAmount)) ||
				Number(data.metadata.feeAmount) <= 0
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Valid fee amount is required for FEE transactions',
					path: ['metadata', 'feeAmount'],
				})
			}
		}
	})

export const milestoneReviewSchema = z.object({
	milestoneId: z.string().min(1, 'Milestone ID is required'),
	reviewerId: z.string().min(1, 'Reviewer ID is required'),
	status: z.enum([
		'pending',
		'approved',
		'rejected',
		'completed',
		'disputed',
	]),
	comments: z.string().optional(),
	signer: z.string().min(1, 'Signer is required'),
	escrowContractAddress: z.string().min(1, 'Escrow contract address is required'),
})

export const escrowFundUpdateSchema = z.object({
	escrowId: z.string().min(1, 'Escrow ID is required'),
	transactionHash: z.string().min(1, 'Transaction hash is required'),
	status: z.enum(['PENDING', 'SUCCESSFUL', 'FAILED']),
})
