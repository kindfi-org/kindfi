import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'

/**
 * POST /api/referrals/donation
 * Record a donation by a referred user (service/recorder role)
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: referral, error: refError } = await (supabase as any)
			.from('referral_records')
			.select('*')
			.eq('referred_id', referred_id)
			.single()

		if (refError || !referral) {
			// Not a referred user, skip silently
			return NextResponse.json({
				reward_points: 0,
				message: 'Not a referred user',
			})
		}

		const old_status = referral.status
		const total_donations = referral.total_donations + 1
		let new_status = referral.status
		let reward_points = 0

		// Check if this is the first donation
		if (referral.first_donation_at === null) {
			new_status = 'first_donation'
			reward_points = 25 // First donation reward
		} else if (total_donations >= 3) {
			new_status = 'active'
		}

		// Update referral record
		const updateData: Record<string, unknown> = {
			total_donations,
			updated_at: new Date().toISOString(),
		}

		if (referral.first_donation_at === null) {
			updateData.first_donation_at = new Date().toISOString()
		}

		if (new_status !== old_status) {
			updateData.status = new_status
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: updatedReferral, error: updateError } = await (supabase as any)
			.from('referral_records')
			.update(updateData)
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

		// Award reward points if first donation
		if (reward_points > 0) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { data: stats } = await (supabase as any)
				.from('referrer_statistics')
				.select('*')
				.eq('referrer_id', referral.referrer_id)
				.single()

			if (stats) {
				const updateStats: Record<string, unknown> = {
					total_reward_points: stats.total_reward_points + reward_points,
					updated_at: new Date().toISOString(),
				}

				if (new_status === 'active') {
					updateStats.active_referrals = stats.active_referrals + 1
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (supabase as any)
					.from('referrer_statistics')
					.update(updateStats)
					.eq('referrer_id', referral.referrer_id)
			}
		}

		return NextResponse.json({
			referral: updatedReferral,
			reward_points,
			status_changed: new_status !== old_status,
		})
	} catch (error) {
		console.error('Error in POST /api/referrals/donation:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
