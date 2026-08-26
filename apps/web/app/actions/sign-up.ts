'use server'

import { appEnvConfig } from '@packages/lib/config'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { AppEnvInterface } from '@packages/lib/types'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { validateCsrfToken } from '~/app/actions/csrf'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { enforceRateLimit, RateLimitExceededError } from '~/lib/auth/rate-limit'
import { sendSignupVerificationOtp } from '~/lib/auth/signup-otp.service'
import { Logger } from '~/lib/logger'
import { signUpInputSchema } from '~/lib/schemas/server-actions.schemas'
import type { AuthResponse } from '~/lib/types/auth'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

async function resolveSignUpEmail(
	formData: FormData,
): Promise<{ ok: true; email: string } | { ok: false; response: AuthResponse }> {
	if (!(await validateCsrfToken(formData.get('csrfToken')?.toString()))) {
		return {
			ok: false,
			response: {
				success: false,
				message: 'Invalid CSRF token',
				error: 'Invalid CSRF token',
			},
		}
	}

	const parsed = signUpInputSchema.safeParse({ email: formData.get('email')?.toString() })
	if (!parsed.success) {
		return {
			ok: false,
			response: {
				success: false,
				message: 'A valid email is required',
				error: 'Invalid input',
			},
		}
	}

	return { ok: true, email: parsed.data.email }
}

async function ensureEmailAvailableForSignUp(email: string): Promise<AuthResponse | null> {
	const { data: existingUser } = await supabaseServiceRole
		.from('profiles')
		.select('id, email')
		.eq('email', email)
		.maybeSingle()

	if (existingUser) {
		return {
			success: false,
			message: 'This account is already registered. Sign in instead!',
			error: 'User already exists',
		}
	}

	return null
}

export async function signUpAction(formData: FormData): Promise<AuthResponse> {
	const appConfig: AppEnvInterface = appEnvConfig('web')
	const resolved = await resolveSignUpEmail(formData)
	if (!resolved.ok) return resolved.response

	const email = resolved.email

	try {
		await enforceRateLimit(email.toLowerCase(), 'sign_up')
	} catch (error) {
		if (error instanceof RateLimitExceededError) {
			return {
				success: false,
				message: error.message,
				error: error.message,
			}
		}
	}

	const existingAccountResponse = await ensureEmailAvailableForSignUp(email)
	if (existingAccountResponse) return existingAccountResponse

	const redirectTo = `${appConfig.deployment.appUrl}/auth/callback?redirect_to=/otp-validation?email=${encodeURIComponent(email)}`

	try {
		await sendSignupVerificationOtp(email, redirectTo)

		revalidatePath('/sign-up', 'layout')
		return {
			success: true,
			message: 'Verification code sent! Please check your email to confirm your account.',
			redirect: `/otp-validation?email=${encodeURIComponent(email)}`,
		}
	} catch (error) {
		logger.error({
			eventType: 'SIGN_UP_OTP_FAILED',
			email,
			error: error instanceof Error ? error.message : 'Unknown error',
		})

		if (error instanceof Error) {
			return {
				success: false,
				message: error.message,
				error: error.message,
			}
		}

		return errorHandler.handleAuthError(error as AuthError, 'sign_up')
	}
}

export async function resendSignUpOtpAction(emailInput: string): Promise<AuthResponse> {
	const parsed = signUpInputSchema.safeParse({ email: emailInput })
	if (!parsed.success) {
		return {
			success: false,
			message: 'A valid email is required',
			error: 'Invalid input',
		}
	}

	const email = parsed.data.email

	try {
		await enforceRateLimit(email.toLowerCase(), 'sign_up_resend')
	} catch (error) {
		if (error instanceof RateLimitExceededError) {
			return {
				success: false,
				message: error.message,
				error: error.message,
			}
		}
	}

	const existingAccountResponse = await ensureEmailAvailableForSignUp(email)
	if (existingAccountResponse) return existingAccountResponse

	const appConfig: AppEnvInterface = appEnvConfig('web')
	const redirectTo = `${appConfig.deployment.appUrl}/auth/callback?redirect_to=/otp-validation?email=${encodeURIComponent(email)}`

	try {
		await sendSignupVerificationOtp(email, redirectTo)
		return {
			success: true,
			message: 'Verification code resent! Please check your inbox.',
		}
	} catch (error) {
		logger.error({
			eventType: 'SIGN_UP_OTP_RESEND_FAILED',
			email,
			error: error instanceof Error ? error.message : 'Unknown error',
		})

		if (error instanceof Error) {
			return {
				success: false,
				message: error.message,
				error: error.message,
			}
		}

		return errorHandler.handleAuthError(error as AuthError, 'sign_up_resend')
	}
}
