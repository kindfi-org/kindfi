'use server'

import { appEnvConfig } from '@packages/lib/config'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { Database } from '@services/supabase'
import type { AuthError } from '@supabase/supabase-js'
import { getServerSession, signOut } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { Logger } from '~/lib/logger'
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
	const appConfig = appEnvConfig('web')
	const supabase = await createSupabaseServerClient()
	const email = formData.get('email') as string
	const signInWithOptOpt = {
		email,
		options: {
			emailRedirectTo: `${appConfig.deployment.appUrl}/auth/callback?redirect_to=/otp-validation?email=${email}`,
			shouldCreateUser: true,
		},
	}

	try {
		const { data, error } = await supabase.auth.signInWithOtp(signInWithOptOpt)
		if (error) {
			return errorHandler.handleAuthError(error, 'sign_up')
		}

		revalidatePath('/', 'layout')
		console.log('Sign up data: ', data)
		return {
			success: true,
			message:
				'Verification code sent! Please check your email to confirm your account.',
			redirect: `/otp-validation?email=${encodeURIComponent(signInWithOptOpt.email)}`,
			data,
		}
	} catch (error) {
		return errorHandler.handleAuthError(error as AuthError, 'sign_up')
	}
}

export async function signInAction(formData: FormData): Promise<AuthResponse> {
	const email = formData.get('email') as string

	if (!email) {
		return {
			success: false,
			message: 'Email is required',
			error: 'Email is required',
		}
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		return {
			success: false,
			message: 'Invalid email format',
			error: 'Invalid email format',
		}
	}

	// For passkey authentication, we just validate the email exists in our system
	const supabase = await createSupabaseServerClient()

	try {
		const { data: userData, error: userError } = await supabase
			.from('profiles')
			.select('id, email')
			.eq('email', email)
			.single()

		if (userError || !userData) {
			return {
				success: false,
				message: 'Email not found. Please sign up first.',
				error: 'User not found',
			}
		}

		return {
			success: true,
			message: 'Email validated. Proceed with passkey authentication.',
			data: { userId: userData.id, email: userData.email },
		}
	} catch (error) {
		return errorHandler.handleAuthError(error as AuthError, 'sign_in')
	}
}

export async function createSessionAction({
	userId,
	email,
}: {
	userId: string
	email: string
}): Promise<AuthResponse> {
	const supabase = await createSupabaseServerClient()

	try {
		// Verify the user exists and the email matches
		const { data: userData, error: userError } = await supabase
			.from('profiles')
			.select('id, email')
			.eq('id', userId)
			.eq('email', email)
			.single()

		if (userError || !userData) {
			return {
				success: false,
				message:
					'User verification failed. Email does not match registered user.',
				error: 'User verification failed',
			}
		}

		// Create a session for the verified user
		const { data: sessionData, error: sessionError } =
			await supabase.auth.admin.generateLink({
				type: 'magiclink',
				email: email,
			})

		if (sessionError) {
			return errorHandler.handleAuthError(sessionError, 'create_session')
		}

		logger.info({
			eventType: 'SESSION_CREATED',
			userId,
			email,
		})

		revalidatePath('/', 'layout')
		return {
			success: true,
			message: 'Session created successfully',
			redirect: '/dashboard',
			data: sessionData,
		}
	} catch (error) {
		logger.error({
			eventType: 'SESSION_CREATION_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			userId,
			email,
		})
		return errorHandler.handleAuthError(error as AuthError, 'create_session')
	}
}

export async function signOutAction(): Promise<void> {
	const supabase = await createSupabaseServerClient()

	try {
		// Clear NextAuth session
		await signOut({ redirect: false })
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

export async function requestResetAccountAction(
	formData: FormData,
): Promise<void> {
	const email = formData.get('email')?.toString()
	const supabase = await createSupabaseServerClient()
	const origin = (await headers()).get('origin')

	if (!email) {
		redirect('/reset-account?error=Email is required')
	}

	try {
		// TODO: Implement a proper reset account flow
		// This is a placeholder for the actual reset account logic
		// const { error } = await supabase.auth.resetPasswordForEmail(email, {
		// 	redirectTo: `${origin}/auth/callback?redirect_to=//reset-account`,
		// })

		// if (error) {
		// 	const response = errorHandler.handleAuthError(error, 'forgot_password')
		// 	redirect(`/reset-account?error=${encodeURIComponent(response.message)}`)
		// }

		redirect(
			'/reset-account?success=Check your email for a confirmation request to reset your account',
		)
	} catch (error) {
		const response = errorHandler.handleAuthError(
			error as AuthError,
			'forgot_password',
		)
		redirect(`/reset-account?error=${encodeURIComponent(response.message)}`)
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

	const supabase = await createSupabaseServerClient()

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
	const supabase = await createSupabaseServerClient()

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
	const supabase = await createSupabaseServerClient()

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
	const supabase = await createSupabaseServerClient()

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
	const supabase = await createSupabaseServerClient()

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
	const supabase = await createSupabaseServerClient()

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
	const supabase = await createSupabaseServerClient()

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
