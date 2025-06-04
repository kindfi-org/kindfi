import { notificationService } from '@packages/lib/services'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const authHeader = request.headers.get('authorization')
		if (!authHeader) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const userId = 'mock-user-id'

		const { notificationId } = await request.json()
		if (
			!notificationId ||
			(typeof notificationId !== 'string' && typeof notificationId !== 'number')
		) {
			return NextResponse.json(
				{ error: 'Invalid notificationId' },
				{ status: 400 },
			)
		}
		const sanitizedId =
			typeof notificationId === 'string'
				? notificationId.trim()
				: String(notificationId)

		await notificationService.markAsRead(sanitizedId, userId)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error marking notification as read:', error)
		return NextResponse.json(
			{ error: 'Failed to mark notification as read' },
			{ status: 500 },
		)
	}
}
