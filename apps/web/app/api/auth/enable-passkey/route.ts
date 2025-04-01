import { NextResponse } from 'next/server'
import { auth } from '~/lib/auth/auth'
import { createClient } from '~/lib/supabase/server'

export async function POST(request: Request) {
	try {
		// Get the session to verify authentication
		const session = await auth()

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Get the request body
		const body = await request.json()
		const { email } = body

		// Verify that the email matches the authenticated user
		if (email !== session.user.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Update the Supabase user record to enable passkey
		const supabase = await createClient()

		const { data: userData, error: userError } = await supabase
			.from('auth.users')
			.select('id')
			.eq('email', email)
			.single()

		if (userError || !userData) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		// Update the user to enable passkey
		const { error } = await supabase.auth.admin.updateUserById(userData.id, {
			user_metadata: {
				passkey_enabled: true,
				passkey_setup_at: new Date().toISOString(),
			},
		})

		if (error) {
			return NextResponse.json(
				{ error: 'Failed to update user' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error enabling passkey:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
