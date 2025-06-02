import { notificationService } from '@packages/lib/services'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@packages/lib/supabase/server/server-client'

export async function POST(request: Request) {
	try {
		const { notificationId } = await request.json()
		if (!notificationId) {
			return NextResponse.json(
				{ error: 'Notification ID is required' },
				{ status: 400 },
			)
		}

		await notificationService.markAsRead(notificationId)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error marking notification as read:', error)
		return NextResponse.json(
			{ error: 'Failed to mark notification as read' },
			{ status: 500 },
		)
	}
}
