import { createSupabaseServerClient } from '@packages/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const supabase = await createSupabaseServerClient()
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 401 })
		}

		if (!user) {
			return NextResponse.json({ error: 'No user found' }, { status: 401 })
		}

		// Return basic user info
		return NextResponse.json({
			user: {
				id: user.id,
				email: user.email,
				email_confirmed_at: user.email_confirmed_at,
				created_at: user.created_at,
			},
		})
	} catch (error) {
		console.error('Error getting user:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
