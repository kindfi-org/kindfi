import { z } from 'zod'

/** Query params for auth callback (OAuth code exchange) */
export const authCallbackQuerySchema = z.object({
	code: z.string().optional(),
	redirect: z.string().min(1, 'Redirect URL is required'),
})

/** Query params for email OTP verification (auth/confirm) */
export const authConfirmQuerySchema = z.object({
	token_hash: z.string().min(1, 'Token hash is required'),
	type: z.enum([
		'signup',
		'recovery',
		'invite',
		'magiclink',
		'email_change',
		'email',
	]),
	next: z.string().default('/'),
})
