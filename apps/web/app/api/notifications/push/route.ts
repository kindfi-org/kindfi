import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { NotificationLogger } from '~/lib/services/notification-logger'
import { NotificationService } from '~/lib/services/notification-service'

const appConfig: AppEnvInterface = appEnvConfig('web')

// Define Zod schemas for request validation
const pushSubscriptionSchema = z.object({
	endpoint: z.string().url(),
	keys: z.object({
		p256dh: z.string(),
		auth: z.string(),
	}),
})

const notificationSchema = z.object({
	title: z.string().min(1),
	body: z.string().min(1),
	icon: z.string().url().optional(),
	badge: z.string().url().optional(),
	data: z.record(z.unknown()).optional(),
})

const requestSchema = z.object({
	subscription: pushSubscriptionSchema,
	notification: notificationSchema,
})

type PushRequestBody = z.infer<typeof requestSchema>

export async function POST(request: Request) {
	const logger = new NotificationLogger()
	const _notificationService = new NotificationService()

	try {
		// Validate request body using Zod schema
		const body = requestSchema.parse(await request.json())
		const { subscription, notification } = body

		// Send push notification
		const response = await fetch(subscription.endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${appConfig.vapid.publicKey}`,
			},
			body: JSON.stringify({
				title: notification.title,
				body: notification.body,
				icon: notification.icon,
				badge: notification.badge,
				data: notification.data,
			}),
		})

		if (!response.ok) {
			throw new Error(
				`Failed to send push notification: ${response.statusText}`,
			)
		}

		// Log successful push notification
		await logger.logInfo({
			message: 'Push notification sent successfully',
			context: {
				endpoint: subscription.endpoint,
				notification: {
					title: notification.title,
					body: notification.body,
				},
			},
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		// Log error and return appropriate response
		await logger.logError({
			message: 'Failed to send push notification',
			error: error instanceof Error ? error : new Error(String(error)),
		})

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request data', details: error.errors },
				{ status: 400 },
			)
		}

		return NextResponse.json(
			{ error: 'Failed to send push notification' },
			{ status: 500 },
		)
	}
}
