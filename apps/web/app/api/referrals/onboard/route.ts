import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'

/**
 * POST /api/referrals/onboard
 * Mark a referred user as onboarded (service/recorder role)
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { referred_id } = body

		if (!referred_id) {
			return NextResponse.json(
				{ error: 'Missing required field: referred_id' },
				{ status: 400 },
			)
		}

		const supabase = await createSupabaseServerClient()

		// Get referral record
		const { data: referral, error: refError } = await supabase
			.from('referral_records')
			.select('*')
			.eq('referred_id', referred_id)
			.single()

		if (refError || !referral) {
			return NextResponse.json(
				{ error: 'Referral not found' },
				{ status: 404 },
			)
		}

		if (referral.status !== 'pending') {
			return NextResponse.json({
				referral,
				reward_points: 0,
				message: 'Already processed',
			})
		}

		// Update referral status
		const { data: updatedReferral, error: updateError } = await supabase
			.from('referral_records')
			.update({
				status: 'onboarded',
				onboarded_at: new Date().toISOString(),
			})
			.eq('referred_id', referred_id)
			.select()
			.single()

		if (updateError) {
			console.error('Error updating referral:', updateError)
			return NextResponse.json(
				{ error: 'Failed to update referral' },
				{ status: 500 },
			)
		}

		// Update referrer statistics
		const reward_points = 50 // Onboarding reward
		const { data: stats } = await supabase
			.from('referrer_statistics')
			.select('*')
			.eq('referrer_id', referral.referrer_id)
			.single()

		if (stats) {
			await supabase
				.from('referrer_statistics')
				.update({
					total_reward_points: stats.total_reward_points + reward_points,
					updated_at: new Date().toISOString(),
				})
				.eq('referrer_id', referral.referrer_id)
		}

		return NextResponse.json({
			referral: updatedReferral,
			reward_points,
		})
	} catch (error) {
		console.error('Error in POST /api/referrals/onboard:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
