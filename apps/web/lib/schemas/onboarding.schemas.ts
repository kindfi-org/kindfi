import { z } from 'zod'

export const DISPLAY_NAME_MIN = 2
export const DISPLAY_NAME_MAX = 60
export const BIO_MIN = 10
export const BIO_MAX = 500

export const selectOnboardingRoleInputSchema = z.object({
	role: z.enum(['donor', 'creator']),
})

export const updateOnboardingPersonalInfoInputSchema = z.object({
	displayName: z
		.string()
		.trim()
		.min(DISPLAY_NAME_MIN, `Display name must be at least ${DISPLAY_NAME_MIN} characters`)
		.max(DISPLAY_NAME_MAX, `Display name must be at most ${DISPLAY_NAME_MAX} characters`)
		.refine((value) => value.length > 0, 'Display name is required'),
	bio: z
		.string()
		.trim()
		.min(BIO_MIN, `Bio must be at least ${BIO_MIN} characters`)
		.max(BIO_MAX, `Bio must be at most ${BIO_MAX} characters`),
})

export const completeOnboardingTourInputSchema = z.object({
	completed: z.boolean().default(true),
})
