import { z } from 'zod'

const escrowStatusEnum = z.enum([
	'NEW',
	'FUNDED',
	'ACTIVE',
	'COMPLETED',
	'DISPUTED',
	'CANCELLED',
])

export type EscrowStatusInput = z.infer<typeof escrowStatusEnum>

export const updateEscrowStatusInputSchema = z.object({
	id: z.string().uuid('Invalid escrow record id'),
	newStatus: escrowStatusEnum,
})

export const updateEscrowMilestoneInputSchema = z.object({
	id: z.string().uuid('Invalid escrow record id'),
	current: z.number().int().min(0),
	completed: z.number().int().min(0),
})

export const updateEscrowFinancialsInputSchema = z
	.object({
		id: z.string().uuid('Invalid escrow record id'),
		funded: z.number().min(0),
		released: z.number().min(0),
	})
	.refine((data) => data.released <= data.funded, {
		message: 'Released amount cannot exceed funded amount',
		path: ['released'],
	})

export const updateDeviceWithDeployeeInputSchema = z.object({
	credentialId: z.string().min(1, 'credentialId is required'),
	aaguid: z.string().min(1, 'aaguid is required'),
})

export const signUpInputSchema = z.object({
	email: z.string().email('A valid email is required'),
})

export const requestResetAccountInputSchema = z.object({
	email: z.string().email('A valid email is required'),
})

export const resetPasswordInputSchema = z
	.object({
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters long')
			.max(128, 'Password is too long'),
		confirmPassword: z.string().min(1, 'Confirm password is required'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})

export const createSessionInputSchema = z.object({
	userId: z.string().uuid('Invalid userId'),
	email: z.string().email('A valid email is required'),
})

const stellarAddressSchema = z
	.string()
	.min(1, 'Address is required')
	.regex(/^G[A-Z2-7]{55}$/, 'Invalid Stellar address')

const escrowMilestoneSchema = z.object({
	amount: z.number().positive('Milestone amount must be positive'),
	receiver: stellarAddressSchema,
})

const escrowDataSchema = z
	.object({
		engagementId: z.string().min(1, 'engagementId is required'),
		title: z.string().min(1),
		description: z.string().min(1),
		roles: z.object({
			approver: stellarAddressSchema,
			serviceProvider: stellarAddressSchema,
			disputeResolver: stellarAddressSchema,
			platformAddress: stellarAddressSchema,
			releaseSigner: stellarAddressSchema,
		}),
		platformFee: z.number().min(0).max(100),
		milestones: z.array(escrowMilestoneSchema).optional(),
		amount: z.number().positive().optional(),
		receiver: stellarAddressSchema.optional(),
		receiverMemo: z.number().int().optional(),
	})
	.refine(
		(data) =>
			(data.milestones && data.milestones.length > 0) ||
			(data.amount !== undefined && data.receiver !== undefined),
		{
			message:
				'Either milestones or single-release amount/receiver must be provided',
		},
	)
	.refine(
		(data) => {
			if (!data.milestones || data.milestones.length === 0) return true
			const first = data.milestones[0].receiver
			return data.milestones.every((m) => m.receiver === first)
		},
		{
			message:
				'All milestones must share the same receiver address (multi-receiver escrows are not supported)',
			path: ['milestones'],
		},
	)

export const saveEscrowContractInputSchema = z.object({
	projectId: z.string().uuid('Invalid projectId'),
	contractId: z
		.string()
		.min(1, 'contractId is required')
		.max(120, 'contractId is too long'),
	engagementId: z.string().min(1).optional(),
	escrowData: escrowDataSchema,
})

export const createFoundationInputSchema = z.object({
	name: z.string().min(1, 'Name is required').max(120),
	description: z.string().min(1, 'Description is required').max(2000),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.max(60)
		.regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
	foundedYear: z
		.number()
		.int()
		.min(1900, 'Invalid founded year')
		.max(new Date().getFullYear() + 1),
	mission: z.string().max(2000).optional(),
	vision: z.string().max(2000).optional(),
	websiteUrl: z
		.string()
		.url('Invalid website URL')
		.optional()
		.or(z.literal('')),
	socialLinks: z.record(z.string(), z.string().url('Invalid URL')).optional(),
})

export { stellarAddressSchema }
