import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { env } from '~/lib/config/env'

// Configure web-push with VAPID keys
webpush.setVapidDetails(
	`mailto:${env.VAPID_EMAIL}`,
	env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	env.VAPID_PRIVATE_KEY,
)

export async function POST(request: Request) {
	try {
		const { subscription, notification } = await request.json()

		// Validate subscription
		if (!subscription || !subscription.endpoint) {
			return NextResponse.json(
				{ error: 'Invalid push subscription' },
				{ status: 400 },
			)
		}

		// Validate notification
		if (!notification || !notification.title || !notification.message) {
			return NextResponse.json(
				{ error: 'Invalid notification data' },
				{ status: 400 },
			)
		}

		// Send push notification
		try {
			await webpush.sendNotification(
				subscription,
				JSON.stringify({
					title: notification.title,
					message: notification.message,
					action_url: notification.action_url,
					metadata: notification.metadata,
				}),
			)

			return NextResponse.json({ success: true })
		} catch (error) {
			// Handle specific web-push errors
			if (error instanceof Error) {
				if (error.message.includes('VAPID')) {
					return NextResponse.json(
						{ error: 'Invalid VAPID configuration' },
						{ status: 500 },
					)
				}
				if (error.message.includes('subscription')) {
					return NextResponse.json(
						{ error: 'Invalid push subscription' },
						{ status: 400 },
					)
				}
			}
			throw error // Re-throw other errors
		}
	} catch (error) {
		console.error('Error sending push notification:', error)
		return NextResponse.json(
			{ error: 'Failed to send push notification' },
			{ status: 500 },
		)
	}
}
