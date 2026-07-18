'use server'

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { AuthError } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import {
	createSessionInputSchema,
	updateDeviceWithDeployeeInputSchema,
} from '~/lib/schemas/server-actions.schemas'
import type { AuthResponse } from '~/lib/types/auth'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

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
			.select('id, email')
			.eq('id', validated.userId)
			.single()

		if (userError || !userData) {
			return {
				success: false,
				message: 'User verification failed. User profile not found.',
				error: 'User verification failed',
			}
		}

		const normalizedInputEmail = validated.email.trim().toLowerCase()
		const normalizedProfileEmail = userData.email?.trim().toLowerCase()

		if (normalizedProfileEmail && normalizedProfileEmail !== normalizedInputEmail) {
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
		const { and, db, eq } = await import('@packages/drizzle')
		const { devices } = await import('@packages/drizzle/src/data/schema')

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
