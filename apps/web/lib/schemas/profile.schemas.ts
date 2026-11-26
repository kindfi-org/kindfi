import { isClassicAccountAddress } from '@packages/lib/utils/wallet-address'
import { z } from 'zod'

export const updateSlugSchema = z.object({
	slug: z
		.string()
		.min(1, 'Slug is required')
		.max(30)
		.regex(
			/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/,
			'Slug must be 2-30 chars, lowercase alphanumeric with hyphens',
		)
		.transform((s) => s.trim().toLowerCase()),
})

export const followActionSchema = z.object({
	targetUserId: z.string().uuid('Invalid target user ID'),
	action: z.enum(['follow', 'unfollow']),
})

export const linkExternalWalletSchema = z.object({
	address: z
		.string()
		.refine(isClassicAccountAddress, 'Must be a valid classic Stellar account (G-address)')
		.nullable(),
})
