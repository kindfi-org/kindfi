'use server'

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { AuthError } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { validateCsrfToken } from '~/app/actions/csrf'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import {
	enforceRateLimit,
	getAuthenticatedSession,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import {
	requestResetAccountInputSchema,
	resetPasswordInputSchema,
} from '~/lib/schemas/server-actions.schemas'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

export async function requestResetAccountAction(formData: FormData): Promise<void> {
	if (!(await validateCsrfToken(formData.get('csrfToken')?.toString()))) {
		redirect('/reset-account?error=Invalid CSRF token')
	}

	let email: string
	try {
		const validated = validateInput(
			requestResetAccountInputSchema,
			{ email: formData.get('email')?.toString() },
			'requestResetAccountAction',
		)
		email = validated.email
	} catch (_error) {
		redirect('/reset-account?error=A valid email is required')
	}

	try {
		await enforceRateLimit(email.toLowerCase(), 'request_reset_account')
	} catch (_error) {
		redirect('/reset-account?error=Too many requests. Try again later.')
	}

	logger.warn({
		eventType: 'RESET_ACCOUNT_NOT_IMPLEMENTED',
		email,
	})
	redirect(
		'/reset-account?error=Account recovery is temporarily unavailable. Please contact support.',
	)
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
	if (!(await validateCsrfToken(formData.get('csrfToken')?.toString()))) {
		redirect('/reset-password?error=Invalid CSRF token')
	}

	const session = await getAuthenticatedSession()
	if (!session) {
		redirect(
			'/reset-password?error=You must follow the recovery link sent to your email before resetting your password.',
		)
	}

	let password: string
	try {
		const validated = validateInput(
			resetPasswordInputSchema,
			{
				password: formData.get('password')?.toString() ?? '',
				confirmPassword: formData.get('confirmPassword')?.toString() ?? '',
			},
			'resetPasswordAction',
		)
		password = validated.password
	} catch (_error) {
		redirect(
			'/reset-password?error=Password must be at least 8 characters and match the confirmation.',
		)
	}

	try {
		await enforceRateLimit(session.user.id, 'reset_password')
	} catch (_error) {
		redirect('/reset-password?error=Too many requests. Try again later.')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { error } = await supabase.auth.updateUser({ password })

		if (error) {
			const response = errorHandler.handleAuthError(error, 'reset_password')
			redirect(`/reset-password?error=${encodeURIComponent(response.message)}`)
		}

		redirect('/sign-in?success=Password updated successfully')
	} catch (error) {
		if (
			error &&
			typeof error === 'object' &&
			'digest' in error &&
			(error.digest as string | undefined)?.startsWith('NEXT_REDIRECT')
		) {
			throw error
		}
		const response = errorHandler.handleAuthError(error as AuthError, 'reset_password')
		redirect(`/reset-password?error=${encodeURIComponent(response.message)}`)
	}
}
