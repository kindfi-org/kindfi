'use server'

import type { Database } from '@services/supabase/database.types'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { Logger } from '~/lib/logger'
import { createClient } from '~/lib/supabase/server'
import type { AuthResponse } from '~/lib/types/auth'

type Tables = Database['public']['Tables']
type EscrowRecord = Tables['escrow_status']['Row']
type EscrowStatusType =
	| 'NEW'
	| 'FUNDED'
	| 'ACTIVE'
	| 'COMPLETED'
	| 'DISPUTED'
	| 'CANCELLED'

type EscrowResponse = {
	success: boolean
	message: string
	data?: EscrowRecord | EscrowRecord[] | null
	error?: string | null
}

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
	} catch (error) {
		return errorHandler.handleAuthError(error as AuthError, 'sign_up')
	}
}

export async function signInAction(formData: FormData): Promise<void> {
	const supabase = await createClient()
	const email = formData.get('email') as string
	const password = formData.get('password') as string

	if (!email || !password) {
		const response = {
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
			errorHandler.handleAuthError(error, 'sign_in')
		}

		const response = {
			success: true,
			message: 'Successfully signed in',
			redirect: '/dashboard',
		}
	} catch (error) {
		errorHandler.handleAuthError(error as AuthError, 'sign_in')
	}
}

export async function signOutAction(): Promise<void> {
	const supabase = await createClient()

	try {
		const { error } = await supabase.auth.signOut()
		if (error) {
			const response = errorHandler.handleAuthError(error, 'sign_out')
			redirect(`/?error=${encodeURIComponent(response.message)}`)
		}

		redirect('/sign-in?success=Successfully signed out')
	} catch (error) {
		const response = errorHandler.handleAuthError(
			error as AuthError,
			'sign_out',
		)
		redirect(`/?error=${encodeURIComponent(response.message)}`)
	}
}

export async function forgotPasswordAction(formData: FormData): Promise<void> {
	const email = formData.get('email')?.toString()
	const supabase = await createClient()
	const origin = (await headers()).get('origin')

	if (!email) {
		redirect('/forgot-password?error=Email is required')
	}

	try {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
		})

		if (error) {
			const response = errorHandler.handleAuthError(error, 'forgot_password')
			redirect(`/forgot-password?error=${encodeURIComponent(response.message)}`)
		}

		redirect(
			'/forgot-password?success=Check your email for a link to reset your password',
		)
	} catch (error) {
		const response = errorHandler.handleAuthError(
			error as AuthError,
			'forgot_password',
		)
		redirect(`/forgot-password?error=${encodeURIComponent(response.message)}`)
	}
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
	const password = formData.get('password') as string
	const confirmPassword = formData.get('confirmPassword') as string

	if (!password || !confirmPassword) {
		redirect('/reset-password?error=Password and confirm password are required')
	}

	if (password !== confirmPassword) {
		redirect('/reset-password?error=Passwords do not match')
	}

	const supabase = await createClient()

	try {
		const { error } = await supabase.auth.updateUser({
			password: password,
		})

		if (error) {
			const response = errorHandler.handleAuthError(error, 'reset_password')
			redirect(`/reset-password?error=${encodeURIComponent(response.message)}`)
		}

		redirect('/sign-in?success=Password updated successfully')
	} catch (error) {
		const response = errorHandler.handleAuthError(
			error as AuthError,
			'reset_password',
		)
		redirect(`/reset-password?error=${encodeURIComponent(response.message)}`)
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
	} catch (error) {
		return errorHandler.handleAuthError(error as AuthError, 'check_auth')
	}
}

export async function updateEscrowStatusAction(
	id: string,
	newStatus: EscrowStatusType,
): Promise<EscrowResponse> {
	const supabase = await createClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				status: newStatus,
				last_updated: new Date().toISOString(),
			})
			.eq('id', id)
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: `Status updated to ${newStatus}`,
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_STATUS_UPDATE_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			id,
			newStatus,
		})
		return {
			success: false,
			message: 'Failed to update escrow status',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function updateEscrowMilestoneAction(
	id: string,
	current: number,
	completed: number,
): Promise<EscrowResponse> {
	const supabase = await createClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				current_milestone: current,
				metadata: {
					milestoneStatus: {
						current,
						completed,
					},
				},
				last_updated: new Date().toISOString(),
			})
			.eq('id', id)
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: 'Milestone updated successfully',
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_MILESTONE_UPDATE_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			id,
			current,
			completed,
		})
		return {
			success: false,
			message: 'Failed to update milestone',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function updateEscrowFinancialsAction(
	id: string,
	funded: number,
	released: number,
): Promise<EscrowResponse> {
	const supabase = await createClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				total_funded: funded,
				total_released: released,
				last_updated: new Date().toISOString(),
			})
			.eq('id', id)
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: 'Financials updated successfully',
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_FINANCIALS_UPDATE_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			id,
			funded,
			released,
		})
		return {
			success: false,
			message: 'Failed to update financials',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function getEscrowRecordsAction(): Promise<EscrowResponse> {
	const supabase = await createClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.select('*')
			.order('last_updated', { ascending: false })

		if (error) throw error

		return {
			success: true,
			message: 'Records fetched successfully',
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_RECORDS_FETCH_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
		return {
			success: false,
			message: 'Failed to fetch records',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function insertTestEscrowRecordAction(): Promise<EscrowResponse> {
	const supabase = await createClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.insert([
				{
					escrow_id: `test-${Date.now()}`,
					status: 'NEW' as EscrowStatusType,
					current_milestone: 1,
					total_funded: 1000,
					total_released: 0,
					metadata: {
						milestoneStatus: {
							total: 3,
							completed: 0,
						},
					},
				},
			])
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: 'Test record inserted successfully',
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_TEST_RECORD_INSERT_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
		return {
			success: false,
			message: 'Failed to insert test record',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
