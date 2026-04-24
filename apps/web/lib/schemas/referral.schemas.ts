import { z } from 'zod'

export const createReferralSchema = z
	.object({
		referrer_id: z.string().uuid('Invalid referrer ID'),
		referred_id: z.string().uuid('Invalid referred ID'),
	})
	.refine((data) => data.referrer_id !== data.referred_id, {
		message: 'Cannot refer yourself',
		path: ['referred_id'],
	})

export const referralDonationSchema = z.object({
	referred_id: z.string().uuid('Invalid referred ID'),
	referred_address: z.string().optional(),
})

export const referralOnboardSchema = z.object({
	referred_id: z.string().uuid('Invalid referred ID'),
})
