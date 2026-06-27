'use server'

import { appEnvConfig } from '@packages/lib/config'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { AppEnvInterface } from '@packages/lib/types'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { validateCsrfToken } from '~/app/actions/csrf'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { enforceRateLimit, RateLimitExceededError } from '~/lib/auth/rate-limit'
import { Logger } from '~/lib/logger'
import { signUpInputSchema } from '~/lib/schemas/server-actions.schemas'
import type { AuthResponse } from '~/lib/types/auth'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

const OTP_REQUEST_TIMEOUT_MS = 25_000

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout> | undefined
	const timeout = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error(message)), ms)
	})
	try {
		return await Promise.race([promise, timeout])
	} finally {
		if (timeoutId) clearTimeout(timeoutId)
	}
}

export async function signUpAction(formData: FormData): Promise<AuthResponse> {
	const appConfig: AppEnvInterface = appEnvConfig('web')

	if (!(await validateCsrfToken(formData.get('csrfToken')?.toString()))) {
		return {
			success: false,
			message: 'Invalid CSRF token',
			error: 'Invalid CSRF token',
		}
	}

	const parsed = signUpInputSchema.safeParse({ email: formData.get('email')?.toString() })
	if (!parsed.success) {
		return {
			success: false,
			message: 'A valid email is required',
			error: 'Invalid input',
		}
	}
	const email = parsed.data.email

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

	const supabase = supabaseServiceRole

	const { data: existingUser } = await supabase
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

	const signInWithOtpOptions = {
		email,
		options: {
			emailRedirectTo: `${appConfig.deployment.appUrl}/auth/callback?redirect_to=/otp-validation?email=${encodeURIComponent(email)}`,
		},
	}

	try {
		const { data, error } = await withTimeout(
			supabase.auth.signInWithOtp(signInWithOtpOptions),
			OTP_REQUEST_TIMEOUT_MS,
			'Verification email request timed out. Please try again.',
		)

		if (error) {
			return errorHandler.handleAuthError(error, 'sign_up')
		}

		revalidatePath('/sign-up', 'layout')
		return {
			success: true,
			message: 'Verification code sent! Please check your email to confirm your account.',
			redirect: `/otp-validation?email=${encodeURIComponent(email)}`,
			data,
		}
	} catch (error) {
		if (error instanceof Error && error.message.includes('timed out')) {
			logger.error({
				eventType: 'SIGN_UP_OTP_TIMEOUT',
				email,
			})
			return {
				success: false,
				message: error.message,
				error: error.message,
			}
		}
		return errorHandler.handleAuthError(error as AuthError, 'sign_up')
	}
}
