// app/api/kyc/didit/create-session/route.ts

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createDiditSession } from '~/lib/services/didit'

/**
 * POST /api/kyc/didit/create-session
 *
 * Creates a Didit verification session for the authenticated user
 */
export async function POST(req: NextRequest) {
	try {
		// Get user session from NextAuth
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id || !session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { redirectUrl, metadata } = body

		// Create Didit session
		const diditSession = await createDiditSession(
			session.user.email,
			redirectUrl,
			{
				userId: session.user.id,
				...(metadata || {}),
			},
		)

		// Store session in database using Supabase
		// Use service role client since we've already validated the user via NextAuth
		// and we're explicitly setting the user_id
		const { error: dbError } = await supabaseServiceRole
			.from('kyc_reviews')
			.upsert({
				user_id: session.user.id,
				status: 'pending',
				verification_level: 'enhanced',
				notes: JSON.stringify({
					diditSessionId: diditSession.session_id,
					diditSessionToken: diditSession.session_token,
					createdAt: new Date().toISOString(),
				}),
			})

		if (dbError) {
			console.error('Failed to store KYC session:', dbError)
			// Don't fail the request if DB write fails, session is still created
		}

		return NextResponse.json({
			success: true,
			sessionId: diditSession.session_id,
			verificationUrl: diditSession.url,
		})
	} catch (error) {
		console.error('Error creating Didit session:', error)
		return NextResponse.json(
			{
				error: 'Failed to create verification session',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
