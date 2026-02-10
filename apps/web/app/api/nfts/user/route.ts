import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

/**
 * Gather user stats for impact score and tier progress.
 */
async function getUserStats(
	supabase: import('@packages/lib/types').TypedSupabaseClient,
	userId: string,
) {
	const { data: contributions } = await supabase
		.from('contributions')
		.select('amount')
		.eq('contributor_id', userId)

	const totalDonations = contributions?.length ?? 0

	const { data: quests } = await supabase
		.from('user_quest_progress')
		.select('id')
		.eq('user_id', userId)
		.eq('is_completed', true)

	const questsCompleted = quests?.length ?? 0

	const { data: streaks } = await supabase
		.from('user_streaks')
		.select('current_streak')
		.eq('user_id', userId)
		.order('current_streak', { ascending: false })
		.limit(1)

	const streakDays = streaks?.[0]?.current_streak ?? 0

	const { data: referrals } = await supabase
		.from('referral_records')
		.select('id')
		.eq('referrer_id', userId)

	const referralCount = referrals?.length ?? 0

	const impactScore =
		totalDonations * 10 +
		questsCompleted * 25 +
		streakDays * 5 +
		referralCount * 15

	return {
		impactScore,
		totalDonations,
		questsCompleted,
		streakDays,
		referralCount,
	}
}

/**
 * GET /api/nfts/user
 *
 * Get the current user's NFT record from the database (fast path).
 * Also returns computed stats (impact score, etc.) for tier progress display.
 */
export async function GET() {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { supabase } = await import('@packages/lib/supabase')

		const [nftResult, stats] = await Promise.all([
			supabase
				.from('user_nfts')
				.select('*')
				.eq('user_id', session.user.id)
				.single(),
			getUserStats(supabase, session.user.id),
		])

		const { data: nft, error } = nftResult

		if (error && error.code !== 'PGRST116') {
			console.error('Error fetching user NFT:', error)
		}

		return NextResponse.json({
			nft: nft || null,
			stats,
		})
	} catch (error) {
		console.error('Error in GET /api/nfts/user:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
