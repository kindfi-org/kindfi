import { supabase } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'
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
		let notificationId: string | undefined
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
