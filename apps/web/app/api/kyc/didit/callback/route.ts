import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { mapDiditStatusToKYC } from '../../../../../lib/services/didit'

/**
 * POST /api/kyc/didit/callback
 *
 * Handles callback from Didit with status update
 * Called when user is redirected back from Didit verification
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { verificationSessionId, status } = body

		if (!verificationSessionId || !status) {
			return NextResponse.json(
				{ error: 'Missing verificationSessionId or status' },
				{ status: 400 },
			)
		}

		const kycStatus = mapDiditStatusToKYC(status)

		// Find the KYC record by session ID
		const { data: kycRecords, error: findError } = await supabaseServiceRole
			.from('kyc_reviews')
			.select('id, notes')
			.eq('user_id', session.user.id)
			.like('notes', `%${verificationSessionId}%`)
			.order('created_at', { ascending: false })
			.limit(1)

		if (findError) {
			console.error('Error finding KYC record:', findError)
			return NextResponse.json(
				{ error: 'Failed to find KYC record', details: findError.message },
				{ status: 500 },
			)
		}

		if (!kycRecords || kycRecords.length === 0) {
			// No record found - might be a new session, create one
			const { error: insertError } = await supabaseServiceRole
				.from('kyc_reviews')
				.insert({
					user_id: session.user.id,
					status: kycStatus,
					verification_level: 'enhanced',
					notes: JSON.stringify({
						diditSessionId: verificationSessionId,
						diditStatus: status,
						callbackReceived: new Date().toISOString(),
					}),
				})

			if (insertError) {
				console.error('Failed to create KYC record:', insertError)
				return NextResponse.json(
					{ error: 'Failed to create KYC record' },
					{ status: 500 },
				)
			}

			return NextResponse.json({
				success: true,
				status: kycStatus,
				diditStatus: status,
			})
		}

		// Update existing record
		const kycRecord = kycRecords[0]
		const notes =
			typeof kycRecord.notes === 'string'
				? JSON.parse(kycRecord.notes)
				: kycRecord.notes

		const { error: updateError } = await supabaseServiceRole
			.from('kyc_reviews')
			.update({
				status: kycStatus,
				notes: JSON.stringify({
					...notes,
					diditSessionId: verificationSessionId,
					diditStatus: status,
					callbackReceived: new Date().toISOString(),
				}),
				updated_at: new Date().toISOString(),
			})
			.eq('id', kycRecord.id)

		if (updateError) {
			console.error('Failed to update KYC record:', updateError)
			return NextResponse.json(
				{ error: 'Failed to update KYC record' },
				{ status: 500 },
			)
		}

		return NextResponse.json({
			success: true,
			status: kycStatus,
			diditStatus: status,
		})
	} catch (error) {
		console.error('Error processing Didit callback:', error)
		return NextResponse.json(
			{
				error: 'Failed to process callback',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		)
	}
}
