import { STELLAR_G_ADDRESS_REGEX } from '@packages/lib/utils/wallet-address'
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
		.regex(STELLAR_G_ADDRESS_REGEX, 'Must be a valid external Stellar wallet address (G-address)')
		.nullable(),
})
