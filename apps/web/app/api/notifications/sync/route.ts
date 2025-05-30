import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const syncSchema = z.object({
	lastSync: z.string().datetime().optional(),
})

export async function POST(request: Request) {
	try {
		const supabase = createRouteHandlerClient({ cookies })

		// Check authentication
		const {
			data: { session },
		} = await supabase.auth.getSession()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Parse request body
		const body = await request.json()
		const { lastSync } = syncSchema.parse(body)

		// Query notifications
		const { data: notifications, error } = await supabase
			.from('notifications')
			.select('*')
			.eq('to', session.user.id)
			.eq('delivery_status', 'pending')
			.order('created_at', { ascending: false })
			.limit(50)

		if (error) {
			console.error('Error fetching notifications:', error)
			return NextResponse.json(
				{ error: 'Failed to fetch notifications' },
				{ status: 500 },
			)
		}

		// Update delivery status
		if (notifications.length > 0) {
			const { error: updateError } = await supabase
				.from('notifications')
				.update({ delivery_status: 'delivered' })
				.in(
					'id',
					notifications.map((n) => n.id),
				)

			if (updateError) {
				console.error('Error updating notification status:', updateError)
				// Continue anyway since we want to return the notifications
			}
		}

		return NextResponse.json(notifications)
	} catch (error) {
		console.error('Error in notification sync:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
