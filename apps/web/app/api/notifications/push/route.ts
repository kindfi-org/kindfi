import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { env } from '~/lib/config/env'
import { z } from 'zod'

webpush.setVapidDetails(
	`mailto:${env.VAPID_EMAIL}`,
	env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	env.VAPID_PRIVATE_KEY,
)

const subscriptionSchema = z.object({
	endpoint: z.string().url(),
	keys: z.object({
		p256dh: z.string(),
		auth: z.string()
	})
})

const notificationSchema = z.object({
	title: z.string().min(1).max(100),
	body: z.string().min(1).max(500),
	icon: z.string().url().optional(),
	badge: z.string().url().optional(),
	data: z.record(z.unknown()).optional()
})

const requestSchema = z.object({
	subscription: subscriptionSchema,
	notification: notificationSchema
})

// Stub rateLimit and logger for now if not implemented
const rateLimit = async () => ({ success: true });
const logger = { error: console.error };

interface PushRequestBody {
	subscription: {
		endpoint: string;
		keys: { p256dh: string; auth: string };
	};
	notification: {
		title: string;
		body: string;
		icon?: string;
		badge?: string;
		data?: Record<string, unknown>;
	};
}

export async function POST(request: Request) {
	try {
		// Rate limiting
		const limiter = await rateLimit();
		if (!limiter.success) {
			return new Response('Too Many Requests', { status: 429 });
		}

		// Request size validation
		const contentLength = request.headers.get('content-length')
		if (contentLength && Number.parseInt(contentLength) > 1024 * 10) { // 10KB limit
			return new Response('Request too large', { status: 413 })
		}

		const body: PushRequestBody = await request.json()
		const { subscription, notification } = body

		// Enhanced subscription validation
		if (
			!subscription ||
			typeof subscription.endpoint !== 'string' ||
			!subscription.keys ||
			typeof subscription.keys.p256dh !== 'string' ||
			typeof subscription.keys.auth !== 'string'
		) {
			return NextResponse.json(
				{ error: 'Invalid push subscription' },
				{ status: 400 },
			)
		}

		// Validate notification
		if (!notification || !notification.title || !notification.body) {
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
					body: notification.body,
					icon: notification.icon,
					badge: notification.badge,
					data: notification.data,
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
		logger.error('Push notification error:', error)
		
		if (error instanceof z.ZodError) {
			return new Response('Invalid request data', { status: 400 })
		}
		
		if (error instanceof Error && error.message.includes('VAPID')) {
			return new Response('VAPID configuration error', { status: 500 })
		}
		
		return new Response('Internal server error', { status: 500 })
	}
}
