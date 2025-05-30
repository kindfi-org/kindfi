import { createServerClient } from '@kindfi/lib'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const supabase = createServerClient()
		const { notificationIds } = await request.json()

		const { error } = await supabase.rpc('mark_notifications_as_read', {
			p_notification_ids: notificationIds,
		})

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error syncing notifications:', error)
		return NextResponse.json(
			{ error: 'Failed to sync notifications' },
			{ status: 500 },
		)
	}
}
