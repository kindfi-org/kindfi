import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'

/**
 * GET /api/referrals
 * Get user's referral information
 */
export async function GET(_req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const supabase = await createSupabaseServerClient()

		// Get referrals where user is referrer
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: referrals, error: referralsError } = await (supabase as any)
			.from('referral_records')
			.select('*')
			.eq('referrer_id', session.user.id)
			.order('created_at', { ascending: false })

		if (referralsError) {
			console.error('Error fetching referrals:', referralsError)
		}

		// Get referrer statistics
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: stats, error: statsError } = await (supabase as any)
			.from('referrer_statistics')
			.select('*')
			.eq('referrer_id', session.user.id)
			.single()

		if (statsError && statsError.code !== 'PGRST116') {
			console.error('Error fetching referrer stats:', statsError)
		}

		// Check if user was referred
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: referredRecord } = await (supabase as any)
			.from('referral_records')
			.select('*')
			.eq('referred_id', session.user.id)
			.single()

		return NextResponse.json({
			referrals: referrals || [],
			statistics: stats || {
				total_referrals: 0,
				active_referrals: 0,
				total_reward_points: 0,
			},
			referred_by: referredRecord?.referrer_id || null,
		})
	} catch (error) {
		console.error('Error in GET /api/referrals:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

/**
 * POST /api/referrals
 * Create a referral relationship (service/recorder role)
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { referrer_id, referred_id } = body

		if (!referrer_id || !referred_id) {
			return NextResponse.json(
				{ error: 'Missing required fields: referrer_id, referred_id' },
				{ status: 400 },
			)
		}

		if (referrer_id === referred_id) {
			return NextResponse.json(
				{ error: 'Cannot refer yourself' },
				{ status: 400 },
			)
		}

		const supabase = await createSupabaseServerClient()

		// Check if referral already exists
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: existing } = await (supabase as any)
			.from('referral_records')
			.select('id')
			.eq('referred_id', referred_id)
			.single()

		if (existing) {
			return NextResponse.json(
				{ error: 'Referral already exists' },
				{ status: 400 },
			)
		}

		// Create referral record
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: referral, error } = await (supabase as any)
			.from('referral_records')
			.insert({
				referrer_id,
				referred_id,
				status: 'pending',
			})
			.select()
			.single()

		if (error) {
			console.error('Error creating referral:', error)
			return NextResponse.json(
				{ error: 'Failed to create referral' },
				{ status: 500 },
			)
		}

		// Update or create referrer statistics
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: stats } = await (supabase as any)
			.from('referrer_statistics')
			.select('*')
			.eq('referrer_id', referrer_id)
			.single()

		if (stats) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (supabase as any)
				.from('referrer_statistics')
				.update({
					total_referrals: stats.total_referrals + 1,
					updated_at: new Date().toISOString(),
				})
				.eq('referrer_id', referrer_id)
		} else {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (supabase as any).from('referrer_statistics').insert({
				referrer_id,
				total_referrals: 1,
				active_referrals: 0,
				total_reward_points: 0,
			})
		}

		return NextResponse.json({ referral }, { status: 201 })
	} catch (error) {
		console.error('Error in POST /api/referrals:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
