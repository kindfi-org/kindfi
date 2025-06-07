import { supabase } from '@packages/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { env } from '~/lib/config/env'
import { NotificationLogger } from '~/lib/services/notification-logger'

const logger = new NotificationLogger()

const syncPayloadSchema = z.object({
	notificationId: z.string().uuid(),
	status: z.enum(['delivered', 'failed']),
	error: z.string().optional(),
	timestamp: z.number(),
})

/**
 * Type guard to check if an error object has a notificationId property of type string
 * @param error - The error object to check
 * @returns True if the error has a notificationId property of type string
 */
function hasNotificationId(
	error: unknown,
): error is { notificationId: string } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'notificationId' in error &&
		typeof (error as Record<string, unknown>).notificationId === 'string'
	)
}

/**
 * Validates the authorization token and checks user permissions
 * @param token - The JWT token to validate
 * @returns Object containing user ID and role if the token is valid, null otherwise
 */
async function validateToken(
	token: string,
): Promise<{ userId: string; role: string } | null> {
	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token)
		if (error || !user) {
			await logger.logError({
				message: 'Token validation failed',
				error,
				context: { token: `${token.substring(0, 10)}...` },
			})
			return null
		}

		// Get user's role from the database
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single()

		if (profileError || !profile) {
			await logger.logError({
				message: 'Failed to fetch user role',
				error: profileError,
				context: { userId: user.id },
			})
			return null
		}

		return {
			userId: user.id,
			role: profile.role,
		}
	} catch (error) {
		await logger.logError({
			message: 'Token validation failed',
			error,
			context: { token: `${token.substring(0, 10)}...` },
		})
		return null
	}
}

/**
 * Checks if the user has permission to update the notification
 * @param userId - The ID of the user making the request
 * @param notificationId - The ID of the notification to update
 * @returns True if the user has permission, false otherwise
 */
async function hasPermission(
	userId: string,
	notificationId: string,
): Promise<boolean> {
	try {
		const { data, error } = await supabase
			.from('notifications')
			.select('user_id')
			.eq('id', notificationId)
			.single()

		if (error || !data) {
			await logger.logError({
				message: 'Failed to check notification ownership',
				error,
				context: { userId, notificationId },
			})
			return false
		}

		return data.user_id === userId
	} catch (error) {
		await logger.logError({
			message: 'Error checking notification ownership',
			error,
			context: { userId, notificationId },
		})
		return false
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const payload = syncPayloadSchema.parse(body)

		// Log the sync attempt
		await logger.logInfo({
			notificationId: payload.notificationId,
			message: 'Notification sync attempt',
			context: payload,
		})

		// Validate authorization token
		const authHeader = request.headers.get('authorization')
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const token = authHeader.substring(7)
		const auth = await validateToken(token)
		if (!auth) {
			return NextResponse.json(
				{ error: 'Invalid or expired token' },
				{ status: 401 },
			)
		}

		// Check if user has permission to update this notification
		const hasAccess = await hasPermission(auth.userId, payload.notificationId)
		if (!hasAccess) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { error: updateError } = await supabase
			.from('notifications')
			.update({
				status: payload.status,
				delivered_at:
					payload.status === 'delivered' ? new Date(payload.timestamp) : null,
				error: payload.error,
			})
			.eq('id', payload.notificationId)

		if (updateError) {
			await logger.logError({
				message: 'Database update failed',
				error: updateError,
				context: payload,
			})
			return NextResponse.json(
				{ error: 'Failed to update notification status' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		let notificationId: string | undefined = undefined
		if (hasNotificationId(error)) {
			notificationId = error.notificationId
		}
		await logger.logError({
			message: 'Sync error',
			error,
			context: notificationId ? { notificationId } : undefined,
		})

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid sync payload' },
				{ status: 400 },
			)
		}

		return NextResponse.json(
			{ error: 'Failed to process sync' },
			{ status: 500 },
		)
	}
}
