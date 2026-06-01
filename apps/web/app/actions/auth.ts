'use server'

import { and, db, eq } from '@packages/drizzle'
import { devices } from '@packages/drizzle/src/data/schema'
import { appEnvConfig } from '@packages/lib/config'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { AppEnvInterface } from '@packages/lib/types'
import type { Database } from '@services/supabase'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateCsrfToken } from '~/app/actions/csrf'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import {
	enforceRateLimit,
	getAuthenticatedSession,
	requireAdminSession,
	requireAuthenticatedSession,
	type ServerActionFailure,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import {
	createSessionInputSchema,
	requestResetAccountInputSchema,
	resetPasswordInputSchema,
	signUpInputSchema,
	updateDeviceWithDeployeeInputSchema,
	updateEscrowFinancialsInputSchema,
	updateEscrowMilestoneInputSchema,
	updateEscrowStatusInputSchema,
} from '~/lib/schemas/server-actions.schemas'
import type { AuthResponse } from '~/lib/types/auth'

type Tables = Database['public']['Tables']
type EscrowRecord = Tables['escrow_status']['Row']

type EscrowResponse = {
	success: boolean
	message: string
	data?: EscrowRecord | EscrowRecord[] | null
	error?: string | null
}

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

function escrowFailureFromAction(
	failure: ServerActionFailure,
	fallbackMessage: string,
): EscrowResponse {
	return {
		success: false,
		message: failure.error || fallbackMessage,
		error: failure.error,
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

	let email: string
	try {
		const validated = validateInput(
			signUpInputSchema,
			{ email: formData.get('email')?.toString() },
			'signUpAction',
		)
		email = validated.email
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid input')
		return {
			success: false,
			message: failure.error,
			error: failure.error,
		}
	}

	try {
		await enforceRateLimit(email.toLowerCase(), 'sign_up')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return {
			success: false,
			message: failure.error,
			error: failure.error,
		}
	}

	const supabase = supabaseServiceRole

	const { data: existingUser } = await supabase
		.from('profiles')
		.select('id, email')
		.eq('email', email)
		.single()

	if (existingUser) {
		return {
			success: false,
			message: 'This account is already registered. Sign in instead!',
			error: 'User already exists',
		}
	}

	const signInWithOptOpt = {
		email,
		options: {
			emailRedirectTo: `${appConfig.deployment.appUrl}/auth/callback?redirect_to=/otp-validation?email=${email}`,
		},
	}

	try {
		const { data, error } = await supabase.auth.signInWithOtp(signInWithOptOpt)
		if (error) {
			return errorHandler.handleAuthError(error, 'sign_up')
		}

		revalidatePath('/sign-up', 'layout')
		return {
			success: true,
			message: 'Verification code sent! Please check your email to confirm your account.',
			redirect: `/otp-validation?email=${encodeURIComponent(signInWithOptOpt.email)}`,
			data,
		}
	} catch (error) {
		return errorHandler.handleAuthError(error as AuthError, 'sign_up')
	}
}

export async function createSessionAction(input: {
	userId: string
	email: string
}): Promise<AuthResponse> {
	let validated: { userId: string; email: string }
	try {
		validated = validateInput(createSessionInputSchema, input, 'createSessionAction')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid input')
		return {
			success: false,
			message: failure.error,
			error: failure.error,
		}
	}

	try {
		await enforceRateLimit(validated.userId, 'create_session')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return {
			success: false,
			message: failure.error,
			error: failure.error,
		}
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data: userData, error: userError } = await supabase
			.from('profiles')
			.select()
			.eq('id', validated.userId)
			.eq('email', validated.email)
			.single()

		if (userError || !userData) {
			return {
				success: false,
				message: 'User verification failed. Email does not match registered user.',
				error: 'User verification failed',
			}
		}

		logger.info({
			eventType: 'SESSION_CREATED',
			userId: validated.userId,
			email: validated.email,
		})

		return {
			success: true,
			message: 'Session created successfully',
			redirect: '/profile',
			data: userData,
		} as AuthResponse
	} catch (error) {
		logger.error({
			eventType: 'SESSION_CREATION_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			userId: validated.userId,
			email: validated.email,
		})
		return errorHandler.handleAuthError(error as AuthError, 'create_session')
	}
}

export async function signOutAction(): Promise<void> {
	const cookieStore = await cookies()

	try {
		const cookieName =
			process.env.NODE_ENV === 'production'
				? '__Secure-next-auth.session-token'
				: 'next-auth.session-token'

		cookieStore.delete(cookieName)
		cookieStore.delete('csrf-token')

		try {
			const supabase = await createSupabaseServerClient()
			const { error } = await supabase.auth.signOut()

			if (error) {
				logger.warn({
					eventType: 'SUPABASE_SIGN_OUT_ERROR',
					error: error.message,
				})
			}
		} catch (error) {
			logger.warn({
				eventType: 'SUPABASE_SIGN_OUT_EXCEPTION',
				error: error instanceof Error ? error.message : 'Unknown error',
			})
		}

		redirect('/sign-in?success=Successfully signed out')
	} catch (error) {
		if (
			error &&
			typeof error === 'object' &&
			'digest' in error &&
			(error.digest as string | undefined)?.startsWith('NEXT_REDIRECT')
		) {
			throw error
		}

		const response = errorHandler.handleAuthError(error as AuthError, 'sign_out')
		redirect(`/?error=${encodeURIComponent(response.message)}`)
	}
}

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
	newStatus: string,
): Promise<EscrowResponse> {
	try {
		await requireAdminSession('updateEscrowStatusAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	let validated: { id: string; newStatus: EscrowRecord['status'] }
	try {
		validated = validateInput(
			updateEscrowStatusInputSchema,
			{ id, newStatus },
			'updateEscrowStatusAction',
		) as { id: string; newStatus: EscrowRecord['status'] }
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Invalid input'), 'Invalid input')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				status: validated.newStatus,
				last_updated: new Date().toISOString(),
			})
			.eq('id', validated.id)
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: `Status updated to ${validated.newStatus}`,
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_STATUS_UPDATE_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			id: validated.id,
			newStatus: validated.newStatus,
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
	try {
		await requireAdminSession('updateEscrowMilestoneAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	let validated: { id: string; current: number; completed: number }
	try {
		validated = validateInput(
			updateEscrowMilestoneInputSchema,
			{ id, current, completed },
			'updateEscrowMilestoneAction',
		)
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Invalid input'), 'Invalid input')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				current_milestone: validated.current,
				metadata: {
					milestoneStatus: {
						current: validated.current,
						completed: validated.completed,
					},
				},
				last_updated: new Date().toISOString(),
			})
			.eq('id', validated.id)
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
			id: validated.id,
			current: validated.current,
			completed: validated.completed,
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
	try {
		await requireAdminSession('updateEscrowFinancialsAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	let validated: { id: string; funded: number; released: number }
	try {
		validated = validateInput(
			updateEscrowFinancialsInputSchema,
			{ id, funded, released },
			'updateEscrowFinancialsAction',
		)
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Invalid input'), 'Invalid input')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				total_funded: validated.funded,
				total_released: validated.released,
				last_updated: new Date().toISOString(),
			})
			.eq('id', validated.id)
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
			id: validated.id,
			funded: validated.funded,
			released: validated.released,
		})
		return {
			success: false,
			message: 'Failed to update financials',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function getEscrowRecordsAction(): Promise<EscrowResponse> {
	try {
		await requireAdminSession('getEscrowRecordsAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

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
	if (process.env.NODE_ENV === 'production') {
		return {
			success: false,
			message: 'Test record insertion is disabled in production',
			error: 'Forbidden',
		}
	}

	try {
		await requireAdminSession('insertTestEscrowRecordAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.insert([
				{
					escrow_id: `test-${Date.now()}`,
					status: 'NEW',
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

export async function updateDeviceWithDeployee(deployeeUpdateData: string) {
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('updateDeviceWithDeployee')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return {
			success: false,
			message: failure.error,
			error: failure.error,
		}
	}

	let parsed: unknown
	try {
		parsed = JSON.parse(deployeeUpdateData)
	} catch (_error) {
		return {
			success: false,
			message: 'Invalid payload: not valid JSON',
			error: 'Invalid payload',
		}
	}

	let validated: { credentialId: string; aaguid: string }
	try {
		validated = validateInput(
			updateDeviceWithDeployeeInputSchema,
			parsed,
			'updateDeviceWithDeployee',
		)
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid input parameters')
		return {
			success: false,
			message: failure.error,
			error: failure.error,
		}
	}

	const userId = session.user.id
	const { credentialId, aaguid } = validated

	try {
		await enforceRateLimit(userId, 'update_device_with_deployee')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return {
			success: false,
			message: failure.error,
			error: failure.error,
		}
	}

	try {
		const existingDevice = await db
			.select({
				id: devices.id,
				userId: devices.userId,
				aaguid: devices.aaguid,
				credentialId: devices.credentialId,
			})
			.from(devices)
			.where(and(eq(devices.userId, userId), eq(devices.credentialId, credentialId)))
			.limit(1)

		if (!existingDevice.length) {
			return {
				success: false,
				message: 'Device not found or does not belong to user',
				error: 'Device verification failed',
			}
		}

		const deviceToUpdate = existingDevice[0]

		const updatedDevice = await db
			.update(devices)
			.set({
				aaguid: aaguid || deviceToUpdate.aaguid,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(devices.id, deviceToUpdate.id))
			.returning()

		if (!updatedDevice.length) {
			logger.error({
				eventType: 'DEVICE_UPDATE_ERROR',
				error: 'No device was updated',
				userId,
				credentialId,
			})
			return {
				success: false,
				message: 'Failed to update device information',
				error: 'No device was updated',
			}
		}

		logger.info({
			eventType: 'DEVICE_UPDATED',
			userId,
			credentialId,
			aaguid,
		})

		return {
			success: true,
			message: 'Device updated successfully',
			data: updatedDevice[0],
		}
	} catch (error) {
		logger.error({
			eventType: 'DEVICE_UPDATE_EXCEPTION',
			error: error instanceof Error ? error.message : 'Unknown error',
			userId,
			credentialId,
		})

		return {
			success: false,
			message: 'An error occurred while updating the device',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
