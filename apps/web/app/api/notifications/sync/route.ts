import { notificationService } from '@packages/lib/services'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const { userId } = await request.json()
		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 },
			)
		}

		await notificationService.syncNotifications(userId)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error syncing notifications:', error)
		return NextResponse.json(
			{ error: 'Failed to sync notifications' },
			{ status: 500 },
		)
	}
}
