import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

/**
 * GET /api/kyc/status
 *
 * Get the current KYC status for the authenticated user
 */
export async function GET() {
	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Use service role client since we've already validated the user via NextAuth
		const { data: kycRecord, error } = await supabaseServiceRole
			.from('kyc_reviews')
			.select('status, notes, updated_at')
			.eq('user_id', session.user.id)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle()

		if (error) {
			console.error('Error fetching KYC status:', error)
			return NextResponse.json(
				{ error: 'Failed to fetch KYC status', details: error.message },
				{ status: 500 },
			)
		}

		return NextResponse.json({
			status: kycRecord?.status || null,
			updatedAt: kycRecord?.updated_at || null,
		})
	} catch (error) {
		console.error('Error in KYC status API:', error)
		return NextResponse.json(
			{
				error: 'Failed to fetch KYC status',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
