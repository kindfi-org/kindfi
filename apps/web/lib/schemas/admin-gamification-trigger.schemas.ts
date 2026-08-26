import { z } from 'zod'

const stellarAddressSchema = z
	.string()
	.min(1, 'Stellar address is required')
	.regex(/^[GC][A-Z0-9]{55}$/, 'Must be a valid Stellar G- or C-address')

const nftMetadataSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().min(1).max(2000),
	imageUri: z.string().min(1).max(1000),
	externalUrl: z.string().min(1).max(1000).default('https://kindfi.org'),
	attributes: z
		.array(
			z.object({
				trait_type: z.string().min(1),
				value: z.string().min(1),
				display_type: z.string().optional(),
				max_value: z.string().optional(),
			}),
		)
		.default([]),
})

export const adminGamificationTriggerSchema = z.discriminatedUnion('module', [
	z.object({
		module: z.literal('streak'),
		action: z.literal('record_donation'),
		userAddress: stellarAddressSchema,
		period: z.enum(['weekly', 'monthly']),
		donationTimestamp: z.number().int().positive().optional(),
	}),
	z.object({
		module: z.literal('referral'),
		action: z.enum(['create_referral', 'mark_onboarded', 'record_donation']),
		referrerAddress: stellarAddressSchema.optional(),
		referredAddress: stellarAddressSchema,
	}),
	z.object({
		module: z.literal('quest'),
		action: z.literal('update_progress'),
		userAddress: stellarAddressSchema,
		questId: z.number().int().nonnegative(),
		progressValue: z.number().int().nonnegative(),
	}),
	z.object({
		module: z.literal('nft'),
		action: z.enum(['mint', 'update_metadata']),
		toAddress: stellarAddressSchema.optional(),
		tokenId: z.number().int().nonnegative().optional(),
		metadata: nftMetadataSchema.optional(),
	}),
	z.object({
		module: z.literal('reputation'),
		action: z.literal('record_event'),
		userAddress: stellarAddressSchema,
		eventType: z.number().int().min(0).max(7),
		points: z.number().int().positive().optional(),
	}),
	z.object({
		module: z.literal('governance'),
		action: z.literal('record_vote'),
		voterAddress: stellarAddressSchema,
		roundId: z.number().int().nonnegative(),
		optionId: z.number().int().nonnegative(),
		voteType: z.enum(['up', 'down']),
		tier: z.enum(['bronze', 'silver', 'gold', 'diamond']),
	}),
])

export type AdminGamificationTriggerInput = z.infer<typeof adminGamificationTriggerSchema>
