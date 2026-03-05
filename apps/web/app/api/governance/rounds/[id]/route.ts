import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

/**
 * GET /api/governance/rounds/[id]
 *
 * Returns a single governance round with options, aggregated vote weights,
 * and the current user's vote (if authenticated).
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params
		const session = await getServerSession(nextAuthOption)
		const { supabase } = await import('@packages/lib/supabase')

		// Auto-activate / close based on current time
		await supabase.rpc('activate_governance_rounds')
		await supabase.rpc('close_expired_governance_rounds')

		const { data: round, error } = await supabase
			.from('governance_rounds')
			.select(
				`*, options:governance_options!governance_options_round_id_fkey(*)`,
			)
			.eq('id', id)
			.single()

		if (error || !round) {
			return NextResponse.json({ error: 'Round not found' }, { status: 404 })
		}

		// Fetch votes for this round
		const { data: votes } = await supabase
			.from('governance_votes')
			.select('option_id, vote_type, vote_weight, user_id')
			.eq('round_id', id)

		const weightMap: Record<string, { up: number; down: number }> = {}
		let userVote: { option_id: string; vote_type: string } | null = null

		for (const v of votes ?? []) {
			if (!weightMap[v.option_id]) {
				weightMap[v.option_id] = { up: 0, down: 0 }
			}
			if (v.vote_type === 'up') weightMap[v.option_id].up += v.vote_weight
			else weightMap[v.option_id].down += v.vote_weight

			if (session?.user?.id && v.user_id === session.user.id) {
				userVote = { option_id: v.option_id, vote_type: v.vote_type }
			}
		}

		const enrichedOptions = (round.options ?? []).map(
			(opt: { id: string }) => ({
				...opt,
				weighted_upvotes: weightMap[opt.id]?.up ?? 0,
				weighted_downvotes: weightMap[opt.id]?.down ?? 0,
				user_voted: userVote?.option_id === opt.id,
				user_vote_type:
					userVote?.option_id === opt.id ? userVote.vote_type : undefined,
			}),
		)

		// Attach winner option if round ended
		let winner = null
		if (round.winner_option_id) {
			winner =
				enrichedOptions.find(
					(o: { id: string }) => o.id === round.winner_option_id,
				) ?? null
		}

		return NextResponse.json({
			success: true,
			data: {
				...round,
				options: enrichedOptions,
				winner,
				user_has_voted: !!userVote,
				user_voted_option_id: userVote?.option_id ?? null,
			},
		})
	} catch (error) {
		console.error('Error in GET /api/governance/rounds/[id]:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
