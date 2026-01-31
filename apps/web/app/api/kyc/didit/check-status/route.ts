import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	getDiditSessionStatus,
	mapDiditStatusToKYC,
} from '~/lib/services/didit'

/**
 * POST /api/kyc/didit/check-status
 *
 * Checks the current KYC status by querying Didit API directly
 * This is useful when webhooks are delayed or haven't fired yet
 */
export async function POST(_req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Use service role client since we've already validated the user via NextAuth
		// Get the most recent KYC record for this user
		const { data: kycRecord, error: findError } = await supabaseServiceRole
			.from('kyc_reviews')
			.select('notes')
			.eq('user_id', session.user.id)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle()

		if (findError) {
			console.error('Error finding KYC record:', findError)
			return NextResponse.json(
				{ error: 'Failed to find KYC record', details: findError.message },
				{ status: 500 },
			)
		}

		if (!kycRecord || !kycRecord.notes) {
			// No KYC session found - this is okay, user just hasn't started KYC yet
			return NextResponse.json({
				success: false,
				status: null,
				message: 'No KYC session found',
			})
		}

		// Parse notes to get session ID
		const notes =
			typeof kycRecord.notes === 'string'
				? JSON.parse(kycRecord.notes)
				: kycRecord.notes

		const sessionId = notes.diditSessionId

		if (!sessionId) {
			// No session ID in notes - this is okay, might be an old record format
			return NextResponse.json({
				success: false,
				status: null,
				message: 'No session ID found in KYC record',
			})
		}

		// Check status directly from Didit
		const diditStatus = await getDiditSessionStatus(sessionId)

		const kycStatus = mapDiditStatusToKYC(diditStatus.status)

		// Update our database with the latest status
		const { error: updateError } = await supabaseServiceRole
			.from('kyc_reviews')
			.update({
				status: kycStatus,
				notes: JSON.stringify({
					...notes,
					diditSessionId: sessionId,
					diditStatus: diditStatus.status,
					lastChecked: new Date().toISOString(),
					lastUpdated: diditStatus.updated_at || new Date().toISOString(),
				}),
				updated_at: new Date().toISOString(),
			})
			.eq('user_id', session.user.id)

		if (updateError) {
			console.error('Failed to update KYC record:', updateError)
			// Still return the status even if update fails
		}

		return NextResponse.json({
			success: true,
			status: kycStatus,
			diditStatus: diditStatus.status,
		})
	} catch (error) {
		console.error('Error checking KYC status:', error)
		return NextResponse.json(
			{
				error: 'Failed to check KYC status',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
