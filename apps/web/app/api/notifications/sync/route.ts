import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const syncSchema = z.object({
	notificationIds: z.array(z.string().uuid()),
})

export async function POST(request: Request) {
	try {
		const supabase = createRouteHandlerClient({ cookies })

		// Verify authentication
		const {
			data: { session },
			error: authError,
		} = await supabase.auth.getSession()
		if (authError || !session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Validate request body
		const body = await request.json()
		const { notificationIds } = syncSchema.parse(body)

		const { error } = await supabase.rpc('mark_notifications_as_read', {
			p_notification_ids: notificationIds,
		})

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request body' },
				{ status: 400 },
			)
		}
		console.error('Error syncing notifications:', error)
		return NextResponse.json(
			{ error: 'Failed to sync notifications' },
			{ status: 500 },
		)
	}
}
