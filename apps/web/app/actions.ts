'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { Logger } from '~/lib/logger'
import { createClient } from '~/lib/supabase/server'
import type { AuthResponse } from '~/lib/types/auth'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

export async function signUpAction(formData: FormData): Promise<AuthResponse> {
	const supabase = await createClient()
	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	}

	try {
		const { error } = await supabase.auth.signUp(data)
		if (error) {
			return errorHandler.handleAuthError(error, 'sign_up')
		}

		revalidatePath('/', 'layout')
		return {
			success: true,
			message:
				'Account created successfully. Please check your email to confirm your account.',
			redirect: '/sign-in',
		}
	} catch (error: any) {
		return errorHandler.handleAuthError(error, 'sign_up')
	}
}

export async function signInAction(formData: FormData): Promise<AuthResponse> {
	const supabase = await createClient()
	const email = formData.get('email') as string
	const password = formData.get('password') as string

	if (!email || !password) {
		return {
			success: false,
			message: 'Email and password are required',
			error: 'Email and password are required',
		}
	}

	try {
		const { error, data } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			return errorHandler.handleAuthError(error, 'sign_in')
		}

		return {
			success: true,
			message: 'Successfully signed in',
			redirect: '/dashboard',
		}
	} catch (error: any) {
		return errorHandler.handleAuthError(error, 'sign_in')
	}
}

export async function signOutAction(): Promise<AuthResponse> {
	const supabase = await createClient()

	try {
		const { error } = await supabase.auth.signOut()
		if (error) {
			return errorHandler.handleAuthError(error, 'sign_out')
		}

		return {
			success: true,
			message: 'Successfully signed out',
			redirect: '/sign-in',
		}
	} catch (error: any) {
		return errorHandler.handleAuthError(error, 'sign_out')
	}
}

export async function forgotPasswordAction(
	formData: FormData,
): Promise<AuthResponse> {
	const email = formData.get('email')?.toString()
	const supabase = await createClient()
	const origin = (await headers()).get('origin')
	const callbackUrl = formData.get('callbackUrl')?.toString()

	if (!email) {
		return {
			success: false,
			message: 'Email is required',
			error: 'Email is required',
		}
	}

	try {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
		})

		if (error) {
			return errorHandler.handleAuthError(error, 'forgot_password')
		}

		const response: AuthResponse = {
			success: true,
			message: 'Check your email for a link to reset your password.',
		}

		if (callbackUrl) {
			response.redirect = callbackUrl
		}

		return response
	} catch (error: any) {
		return errorHandler.handleAuthError(error, 'forgot_password')
	}
}

export async function resetPasswordAction(
	formData: FormData,
): Promise<AuthResponse> {
	const supabase = await createClient()
	const password = formData.get('password') as string
	const confirmPassword = formData.get('confirmPassword') as string

	if (!password || !confirmPassword) {
		return {
			success: false,
			message: 'Password and confirm password are required',
			error: 'Password and confirm password are required',
		}
	}

	if (password !== confirmPassword) {
		return {
			success: false,
			message: 'Passwords do not match',
			error: 'Passwords do not match',
		}
	}

	try {
		const { error } = await supabase.auth.updateUser({
			password: password,
		})

		if (error) {
			return errorHandler.handleAuthError(error, 'reset_password')
		}

		return {
			success: true,
			message: 'Password updated successfully',
			redirect: '/sign-in',
		}
	} catch (error: any) {
		return errorHandler.handleAuthError(error, 'reset_password')
	}
}

// Helper function to check auth status
export async function checkAuthStatus(): Promise<AuthResponse> {
	const supabase = await createClient()

	try {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession()

		if (error) {
			return errorHandler.handleAuthError(error, 'check_auth')
		}

		if (!session) {
			return {
				success: false,
				message: 'No active session',
				redirect: '/sign-in',
			}
		}

		return {
			success: true,
			message: 'Active session found',
		}
	} catch (error: any) {
		return errorHandler.handleAuthError(error, 'check_auth')
	}
}
